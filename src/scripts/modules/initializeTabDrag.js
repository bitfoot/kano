"use strict";
const onTabDragPointerMove = require("./onTabDragPointerMove");
const onTabDragPointerUp = require("./onTabDragPointerUp");
const resetTransitionVariables = require("./util").resetTransitionVariables;
const easeInQuad = require("./util").easeInQuad;

function initializeTabDrag(event) {
  const eventType = event.type;
  let sign;
  if (eventType == "pointerdown") {
    console.log(`drag initiated from pointerdown event.`);
  } else {
    console.log(`drag initiated from keydown event.`);
  }

  const draggedTab = event.target.parentElement;
  const pointerPosition = event.pageY;
  const container = this.scrollState.container;

  // disable system scrolling while tab is being dragged
  container.classList.add("tab-list-container--no-scroll");
  const tabList = this.tabList;
  const scrollState = this.scrollState;
  const scrollTop = scrollState.scrollTop;
  const tabListHeight = tabList.offsetHeight;
  const headerHeight = scrollState.headerHeight;
  const tabHeight = draggedTab.offsetHeight;
  const margin = 6;

  const wholeContentHeight = this.visibleTabIds.length * (tabHeight + margin);

  const listedTabs = this.tabs;

  const tabsPosInfo = listedTabs.reduce((a, t) => {
    const offsetTop = t.offsetTop;
    const dragOffset = 0;
    let filterOffset = 0;
    if (this.filterState.tabs[t.id]) {
      filterOffset = this.filterState.tabs[t.id].filterOffset;
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

  const tabIndex = this.tabIndices[draggedTab.id][0];
  const tabsAbove = listedTabs.slice(0, tabIndex);
  const tabsBelow = listedTabs.slice(tabIndex + 1);
  const initialTabPos = tabsPosInfo[draggedTab.id].initialPos;

  const initialTopPosInViewport =
    initialTabPos +
    headerHeight -
    scrollState.scrollTop -
    scrollState.tabListOffset;
  const initialBottomPosInViewport = initialTopPosInViewport + tabHeight;

  const shiftY = pointerPosition - initialTabPos - headerHeight + scrollTop;
  // const maxTabPosInList = tabListHeight - margin - tabHeight;
  const maxTabPosInList = wholeContentHeight - margin - tabHeight;
  const minTabPosInList = 0;
  const minTabOffsetInList = initialTabPos * -1;
  const maxTabOffsetInList = maxTabPosInList - initialTabPos;
  const midPoint = (tabHeight + margin) / 2;

  const defaultScrollBoundary = {
    up: 184,
    down: 420
  };

  // draggedTab.setPointerCapture(event.pointerId);
  resetTransitionVariables.call(this);
  draggedTab.classList.add("tab--draggable");
  draggedTab.classList.remove("tab--held-down");

  listedTabs
    .filter(t => t.id !== draggedTab.id)
    .forEach(t => {
      t.classList.add("tab--moving");
    });

  this.dragState = {
    sign,
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
    // kbDragAnimation: null,
    tabsPosInfo,
    scrollState,
    animation: null,
    scroll: false,
    draggedTab,
    midPoint,
    pointerPosition,
    // lastPointerPos: pointerPosition,
    get imaginaryTopPos() {
      if (this.eventType == "pointerdown") {
        return this.pointerPosition - this.shiftY;
      } else {
        return this.tabPosInViewport.top + this.distanceToDrag;
      }
    },
    getDragDistance() {
      if (this.eventType == "pointerdown") {
        let tabPosInViewport = this.tabPosInViewport.top;
        return this.imaginaryTopPos - tabPosInViewport;
      } else {
        const progress = Math.min(1, this.animationElapsed / 220);
        const prevDistance = this.distanceDraggedViaKb;
        const newDistance = easeInQuad(progress, 0, 46, 1) * this.sign;
        const distanceToDrag = newDistance - prevDistance;
        this.distanceToDrag = distanceToDrag;
        this.distanceDraggedViaKb = newDistance;

        if (progress === 1) {
          this.animation = null;
        }

        return distanceToDrag;
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
    // tabMaxPosInViewport: bodyHeight - margin - tabHeight,
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
        this.scrollState.scrollTop;

      return maxOffset;
    },
    get currentMinOffset() {
      const minOffset =
        this.minTabOffsetInList +
        this.scrollState.tabListOffset +
        this.scrollState.scrollTop;
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
