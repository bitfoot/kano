"use strict";
const onTabDragPointerMove = require("./onTabDragPointerMove");
const onTabDragPointerUp = require("./onTabDragPointerUp");
const resetTransitionVariables = require("./util").resetTransitionVariables;
const dragTab = require("./dragTab");

function initializeTabDrag(event) {
  const eventType = event.type;
  if (eventType == "pointerdown") {
    console.log(`drag initiated from pointerdown event.`);
  } else {
    console.log(`drag initiated from keydown event.`);
  }

  const state = this;
  const draggedTab = event.target.parentElement;
  const pointerPosition = event.pageY;
  const container = this.scrollState.container;
  const bodyHeight = document.body.offsetHeight;
  // disable system scrolling while tab is being dragged
  container.classList.add("tab-list-container--no-scroll");
  const tabList = this.tabList;
  const scrollState = this.scrollState;
  const scrollTop = this.scrollState.scrollTop;
  const tabListHeight = tabList.offsetHeight;
  // const headerHeight = document.getElementById("header").offsetHeight;
  const headerHeight = this.scrollState.headerHeight;
  const tabHeight = draggedTab.offsetHeight;
  const margin = 6;

  const wholeContentHeight = state.visibleTabIds.length * (tabHeight + margin);

  const listedTabs = state.tabs;

  const tabsPosInfo = listedTabs.reduce((a, t) => {
    const offsetTop = t.offsetTop;
    const dragOffset = 0;
    let filterOffset = 0;
    if (this.filterState.tabs[t.id]) {
      filterOffset = state.filterState.tabs[t.id].filterOffset;
    }
    const initialPos = offsetTop + filterOffset;

    a[t.id] = {
      offsetTop,
      filterOffset,
      initialPos,
      dragOffset
    };

    return a;
  }, {});

  const tabIndex = state.tabIndices[draggedTab.id][0];
  const tabsAbove = listedTabs.slice(0, tabIndex);
  const tabsBelow = listedTabs.slice(tabIndex + 1);
  const initialTabPos = tabsPosInfo[draggedTab.id].initialPos;

  const initialTopPosInViewport =
    initialTabPos +
    headerHeight -
    scrollState.scrollTop -
    this.scrollState.tabListOffset;
  const initialBottomPosInViewport = initialTopPosInViewport + tabHeight;

  const shiftY = pointerPosition - initialTabPos - headerHeight + scrollTop;
  // const maxTabPosInList = tabListHeight - margin - tabHeight;
  const maxTabPosInList = wholeContentHeight - margin - tabHeight;
  const minTabPosInList = 0;
  const minTabOffsetInList = initialTabPos * -1;
  const maxTabOffsetInList = maxTabPosInList - initialTabPos;

  const defaultScrollBoundary = {
    up: 184,
    down: 420
  };

  // draggedTab.setPointerCapture(event.pointerId);
  draggedTab.classList.add("tab--draggable");
  draggedTab.classList.remove("tab--held-down");
  resetTransitionVariables.call(this);
  listedTabs
    .filter(t => t.id != draggedTab.id)
    .forEach(t => {
      t.classList.add("tab--moveable", "tab--moving");
    });

  this.dragState = {
    animationStart: null,
    animationElapsed: 0,
    distance: 0,
    distanceToDrag: 0,
    elapsed: 0,
    eventType,
    start: null,
    previousTimeStamp: null,
    done: null,
    distanceDraggedViaKb: 0,
    kbDragProgress: 0,
    // get kbDragProgress() {
    //   return this.distanceDraggedViaKb / 46;
    // },
    kbDragAnimation: null,
    tabsPosInfo,
    scrollState,
    animation: null,
    scroll: false,
    draggedTab,
    pointerPosition,
    // lastPointerPos: pointerPosition,
    get imaginaryTopPos() {
      if (this.eventType == "pointerdown") {
        return this.pointerPosition - this.shiftY;
      } else {
        return this.tabPosInViewport.top + this.distanceToDrag;
      }
    },
    headerHeight,
    tabList,
    tabListHeight,
    tabListContainer: container,
    scrollTop,
    initialTabPos,
    initialPosInViewport: {
      top: initialTopPosInViewport,
      bottom: initialBottomPosInViewport
    },
    defaultScrollBoundary,
    scrollBoundary: {
      up: defaultScrollBoundary.up,
      down: defaultScrollBoundary.down
    },

    get tabPosInList() {
      return this.initialTabPos + this.tabsPosInfo[draggedTab.id].dragOffset;
    },

    get tabPosInViewport() {
      let top =
        this.tabPosInList -
        this.scrollTop -
        this.scrollState.tabListOffset +
        this.headerHeight;
      const bottom = top + this.tabHeight;
      return {
        top,
        bottom
      };
    },
    // tabListOffset,
    maxTabListOffset: this.scrollState.maxScrollTop,
    margin,
    tabHeight,
    shiftY,
    listedTabs,
    tabIndex,
    tabsAbove,
    tabsBelow,
    tabMinPosInViewport: headerHeight,
    tabMaxPosInViewport: bodyHeight - margin - tabHeight,
    tabPositionInTheList: 0,
    minTabPosInList,
    maxTabPosInList,
    minTabOffsetInList,
    maxTabOffsetInList,
    lastTabPos: initialTabPos,
    get currentMaxOffset() {
      const maxOffset =
        this.maxTabOffsetInList -
        this.scrollState.maxScrollTop +
        this.scrollState.tabListOffset +
        this.scrollTop;

      return maxOffset;
    },
    get currentMinOffset() {
      const minOffset =
        this.minTabOffsetInList +
        this.scrollState.tabListOffset +
        this.scrollTop;
      return minOffset;
    },

    getScrollDistance() {
      const imaginaryTopPos = this.imaginaryTopPos;
      const imaginaryBottomPos = imaginaryTopPos + this.tabHeight;

      const updateScrollBoundary = () => {
        const initialTopPosInViewport = this.initialPosInViewport.top;
        const initialBottomPosInViewport = this.initialPosInViewport.bottom;
        const defaultUpScrollBoundary = this.defaultScrollBoundary.up;
        const defaultDownScrollBoundary = this.defaultScrollBoundary.down;

        if (initialTopPosInViewport < defaultUpScrollBoundary) {
          if (
            imaginaryTopPos < defaultUpScrollBoundary &&
            imaginaryTopPos > this.scrollBoundary.up
          ) {
            this.scrollBoundary.up = imaginaryTopPos;
          } else if (this.scrollBoundary.up == defaultUpScrollBoundary) {
            this.scrollBoundary.up = initialTopPosInViewport;
          }
        } else if (initialBottomPosInViewport > defaultDownScrollBoundary) {
          if (
            imaginaryBottomPos > defaultDownScrollBoundary &&
            imaginaryBottomPos < this.scrollBoundary.down
          ) {
            this.scrollBoundary.down = imaginaryBottomPos;
          } else if (this.scrollBoundary.down == defaultDownScrollBoundary) {
            this.scrollBoundary.down = initialBottomPosInViewport;
          }
        }
      };

      updateScrollBoundary();

      const getDistance = () => {
        let distance = 0;
        const damper = eventType === "pointerdown" ? 12 : 1;
        if (imaginaryTopPos < this.scrollBoundary.up) {
          distance = (imaginaryTopPos - this.scrollBoundary.up) / damper;
          if (
            this.scrollState.tabListOffset + distance <
            this.scrollState.scrollTop * -1
          ) {
            distance =
              (this.scrollState.scrollTop + this.scrollState.tabListOffset) *
              -1;
          }
        } else if (
          imaginaryBottomPos > this.scrollBoundary.down &&
          this.scrollState.scrollTop + this.scrollState.tabListOffset <
          this.scrollState.maxScrollTop
        ) {
          distance = (imaginaryBottomPos - this.scrollBoundary.down) / damper;
          if (
            this.scrollState.tabListOffset + distance >
            this.scrollState.maxScrollTop
          ) {
            distance =
              this.scrollState.maxScrollTop - this.scrollState.tabListOffset;
          }
        }
        return distance;
      };

      return getDistance();
    }
  };

  if (eventType == "pointerdown") {
    draggedTab.onpointermove = onTabDragPointerMove.bind(this);
    draggedTab.onpointerup = onTabDragPointerUp.bind(this);
  } else {
    draggedTab.onkeydown = e => {
      if (e.code === "ArrowDown" || e.code === "ArrowUp") {
        onTabDragPointerMove.call(this, e);
      }
    };
    draggedTab.onkeyup = e => {
      if (e.code === "Space") {
        onTabDragPointerUp.call(this);
      }
    };
  }
}

module.exports = initializeTabDrag;
