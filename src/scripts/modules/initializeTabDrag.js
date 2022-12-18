"use strict";
const onTabDragPointerMove = require("./onTabDragPointerMove");
const onTabDragEnd = require("./onTabDragEnd");
const resetTransitionVariables = require("./util").resetTransitionVariables;
const easeInQuad = require("./util").easeInQuad;
const easeInOutQuad = require("./util").easeInOutQuad;
const dragTab = require("./dragTab");
const scroll = require("./scroll");

function initializeTabDrag(event) {
  const eventType = event.type;
  // let sign;
  // if (eventType == "pointerdown") {
  //   console.log(`drag initiated from pointerdown event.`);
  // } else {
  //   console.log(`drag initiated from keydown event.`);
  // }

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
    sign: null,
    direction: null,
    arrowKeyIsHeldDown: null,
    totalDistance: 46,
    animationDuration: 220,
    animation: null,
    animationStart: null,
    animationElapsed: 0,
    distanceToDrag: 0,
    elapsed: 0,
    eventType,
    start: null,
    previousTimeStamp: null,
    done: null,
    distanceDraggedViaKb: 0,
    tabsPosInfo,
    scrollState,
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
    },
    getDragDistance() {
      let dragDistance;
      if (this.eventType == "pointerdown") {
        let tabPosInViewport = this.tabPosInViewport.top;
        dragDistance = this.imaginaryTopPos - tabPosInViewport;
      } else {
        // let sign = this.direction === "down" ? 1 : -1;
        // const progress = Math.min(1, this.animationElapsed / 220);
        // const prevDistance = this.distanceDraggedViaKb;
        // this.distanceDraggedViaKb = easeInOutQuad(progress, 0, 46, 1) * sign;
        // this.distanceToDrag = this.distanceDraggedViaKb - prevDistance;
        // dragDistance = this.distanceToDrag;
        // let totalDistance = 46;
        // let duration = 220;
        const prevSign = this.sign;
        this.sign = this.direction === "down" ? 1 : -1;
        let progress = Math.min(
          1,
          this.animationElapsed / this.animationDuration
        );
        let prevDistance = this.distanceDraggedViaKb;
        // if sign changed, then:
        if (prevSign !== null && prevSign !== this.sign) {
          this.animationStart = null;
          this.animationElapsed = 0;
          progress = 0;
          prevDistance = 0;
          const currentPos = this.tabPosInList;
          let desiredPos;
          let desiredIndex;
          if (this.direction === "down") {
            desiredIndex = Math.ceil(currentPos / 46);
            desiredPos = desiredIndex * 46;
            this.totalDistance = desiredPos - currentPos;
          } else {
            desiredIndex = Math.floor(currentPos / 46);
            desiredPos = desiredIndex * 46;
            this.totalDistance = currentPos - desiredPos;
          }
          this.animationDuration = (this.totalDistance / 46) * 220;
        }

        this.distanceDraggedViaKb =
          easeInOutQuad(progress, 0, this.totalDistance, 1) * this.sign;
        this.distanceToDrag = this.distanceDraggedViaKb - prevDistance;
        dragDistance = this.distanceToDrag;
        // console.log(
        //   `totalDistance: ${this.totalDistance}, distanceToDrag: ${this.distanceToDrag
        //   }`
        // );
      }
      return dragDistance;
    },
    step: function (timestamp) {
      if (this.dragState === null) return;
      if (this.dragState.animationStart === null) {
        this.dragState.animationStart = timestamp;
      }

      this.dragState.animationElapsed =
        timestamp - this.dragState.animationStart;

      if (this.dragState.previousTimeStamp !== timestamp) {
        this.dragState.previousTimeStamp = timestamp;
        const dragDistance = this.dragState.getDragDistance();
        const scrollDistance = this.dragState.getScrollDistance();

        if (scrollDistance !== 0) {
          scroll.call(this, { distance: scrollDistance });
        }

        if (
          this.dragState.eventType === "keydown" ||
          this.dragState.animation
        ) {
          dragTab.call(this, { distance: dragDistance });
        }

        if (
          this.dragState.eventType === "pointerdown" &&
          scrollDistance === 0 &&
          (this.dragState.tabPosInList >= this.dragState.minTabPosInList ||
            this.dragState.tabPosInList <= this.dragState.maxTabPosInList)
        ) {
          this.dragState.animation = null;
        }
      }

      if (this.dragState.eventType === "keydown") {
        if (
          this.dragState.animationElapsed >= this.dragState.animationDuration
        ) {
          this.dragState.animationElapsed = 0;
          this.dragState.distanceDraggedViaKb = 0;
          this.dragState.animationStart = null;
          this.dragState.distanceToDrag = 0;
          this.dragState.totalDistance = 46;
          this.dragState.animationDuration = 220;

          if (this.dragState.arrowKeyIsHeldDown === false) {
            this.dragState.animation = null;
          }
        }
      }

      if (this.dragState.animation) {
        window.requestAnimationFrame(this.dragState.step);
      }
    }.bind(this)
  };

  if (eventType == "pointerdown") {
    draggedTab.onpointermove = onTabDragPointerMove.bind(this);
    draggedTab.onpointerup = onTabDragEnd.bind(this);
  } else {
    draggedTab.onkeydown = e => {
      if (e.code === "ArrowDown" || e.code === "ArrowUp") {
        onTabDragPointerMove.call(this, e);
      }
    };
    draggedTab.onkeyup = e => {
      // console.log(e.code);
      if (e.code === "Space" || e.code === "Enter") {
        onTabDragEnd.call(this);
      } else if (e.code === "ArrowDown" || e.code === "ArrowUp") {
        this.dragState.arrowKeyIsHeldDown = false;
      }
    };
  }
}

module.exports = initializeTabDrag;
