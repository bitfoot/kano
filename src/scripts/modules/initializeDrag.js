"use strict";
const onTabDrag = require("./onTabDrag");
const onTabDragEnd = require("./onTabDragEnd");
const getListedTabs = require("./util").getListedTabs;

function initializeDrag(event) {
  const draggedTab = event.target.parentElement;
  const tabListContainer = document.getElementById("tab-list-container");
  // disable system scrolling while tab is being dragged
  tabListContainer.classList.add("tab-list-container--no-scroll");
  const scrollState = this.scrollState;
  const initialScrollTop = this.scrollState.scrollTop;
  const maxScrollTop =
    tabListContainer.scrollHeight - tabListContainer.offsetHeight;
  const tabList = document.getElementById("tab-list");
  const tabListHeight = tabList.offsetHeight;
  const margin = 6;
  const listedTabs = getListedTabs();
  const initialTabPositions = listedTabs.reduce((a, t) => {
    a[t.id] = t.offsetTop;
    return a;
  }, {});
  const tabIndex = listedTabs.findIndex(t => t.id === draggedTab.id);
  const tabsAbove = listedTabs.slice(0, tabIndex);
  const tabsBelow = listedTabs.slice(tabIndex + 1);
  const headerHeight = document.getElementById("header").offsetHeight;
  const tabHeight = 40;
  const tabListOffset = 0;
  const initialPosition = initialTabPositions[draggedTab.id];

  const initialTopPosInViewport =
    initialPosition + headerHeight - scrollState.scrollTop - tabListOffset;
  const initialBottomPosInViewport = initialTopPosInViewport + tabHeight;

  const shiftY =
    event.clientY -
    initialTabPositions[draggedTab.id] -
    headerHeight +
    initialScrollTop;

  const pointerPosition = event.pageY;
  const maxTabPosition = tabListHeight - margin - draggedTab.offsetHeight;
  const minTabPosition = 0;
  const defaultScrollBoundary = {
    up: 184,
    down: 420
  };

  let lastTabPos =
    pointerPosition - shiftY - headerHeight + initialScrollTop + tabListOffset;
  // lastTabPos = Math.min(maxTabPosition, Math.max(minTabPosition, lastTabPos));

  draggedTab.setPointerCapture(event.pointerId);
  draggedTab.classList.add("tab-list-item--draggable");
  draggedTab.classList.remove("tab-list-item--held-down");
  listedTabs
    .filter(t => t.id != draggedTab.id)
    .forEach(t => {
      t.classList.add("tab-list-item--moveable", "tab-list-item--moving");
    });

  this.dragState = {
    scrollState,
    animation: null,
    scroll: false,
    draggedTab,
    pointerPosition,
    headerHeight,
    tabList,
    tabListHeight,
    tabListContainer,
    initialScrollTop,
    initialPosition,
    initialPosInViewport: {
      top: initialTopPosInViewport,
      bottom: initialBottomPosInViewport
    },
    defaultScrollBoundary,
    scrollBoundary: {
      up: defaultScrollBoundary.up,
      down: defaultScrollBoundary.down
    },
    maxScrollTop,
    tabOffset: 0,
    tabListOffset,
    maxTabListOffset: maxScrollTop,
    margin,
    tabHeight,
    shiftY,
    listedTabs,
    tabIndex,
    tabsAbove,
    tabsBelow,
    initialTabPositions,
    tabPositionInTheList: 0,
    minTabPosition,
    maxTabPosition,
    maxTabOffsetAbove: initialTabPositions[draggedTab.id] * -1,
    maxTabOffsetBelow: maxTabPosition - initialTabPositions[draggedTab.id],
    lastTabPos,
    // updatePointerPos(pos) {
    //   this.pointerPosition = pos;
    //   this.lastPointerPos = dragState.pointerPosition;
    // }
    lastPointerPos: null,
    getUpdatedTabPos() {
      const position =
        this.pointerPosition -
        this.shiftY -
        this.headerHeight +
        this.initialScrollTop +
        this.tabListOffset;

      const currentMaxOffsetBelow =
        this.maxTabOffsetBelow -
        this.maxScrollTop +
        this.tabListOffset +
        this.initialScrollTop;

      // console.log(
      //   `FROM getUpdatedTabPos. maxTabOffsetBelow: ${this.maxTabOffsetBelow
      //   }, maxScrollTop: ${this.maxScrollTop}, tabListOffset: ${this.tabListOffset
      //   }, scrollTop: ${this.scrollState.scrollTop}`
      // );

      const currentMaxOffsetAbove =
        this.maxTabOffsetAbove +
        this.tabListOffset +
        this.scrollState.scrollTop;

      const currentMaxPos = this.initialPosition + currentMaxOffsetBelow;
      const currentMinPos = this.initialPosition + currentMaxOffsetAbove;

      // console.log(
      //   `maxTabOffsetBelow: ${this.maxTabOffsetBelow
      //   }, currentMaxOffsetBelow: ${currentMaxOffsetBelow}, maxScrollTop: ${this.maxScrollTop
      //   }, tabListOffset: ${this.tabListOffset}, initialScrollTop: ${this.initialScrollTop
      //   }`
      // );
      // const correctedPosition = Math.min(
      //   currentMaxPos,
      //   Math.max(this.minTabPosition, position)
      // );

      let correctedPosition = Math.max(currentMinPos, position);
      correctedPosition = Math.min(currentMaxPos, correctedPosition);

      // console.log(
      //   `getUpdatedTabPos() position: ${position}, correctedPosition: ${correctedPosition}, maxTabOffsetBelow: ${this.maxTabOffsetBelow
      //   }, currentMaxOffsetBelow: ${currentMaxOffsetBelow}, initialPosition: ${this.initialPosition
      //   }, maxTabPosition: ${this.maxTabPosition}`
      // );

      return correctedPosition;
    },

    shouldScroll() {
      const tabTopPosInViewport = this.pointerPosition - this.shiftY;
      const tabBottomPosInViewport = tabTopPosInViewport + this.tabHeight;
      const initialTopPosInViewport = this.initialPosInViewport.top;
      const initialBottomPosInViewport = this.initialPosInViewport.bottom;

      const defaultUpScrollBoundary = this.defaultScrollBoundary.up;
      const defaultDownScrollBoundary = this.defaultScrollBoundary.down;
      // boundaries may change depending on where the tab is when drag is initiated
      // so for example, if user clicks on the last visible tab and initiates drag, that tab is already below default bottom scroll boundary,
      // and scrolling would be very fast if user were to move this tab even one pixel. To prevent this, boundary value is increased.

      const getScrollBoundary = () => { };

      let distance = 0;

      let upScrollBoundary = this.scrollBoundary.up;
      let downScrollBoundary = this.scrollBoundary.down;

      if (initialBottomPosInViewport > defaultDownScrollBoundary) {
        if (
          tabBottomPosInViewport > defaultDownScrollBoundary &&
          tabBottomPosInViewport < downScrollBoundary
        ) {
          downScrollBoundary = tabBottomPosInViewport;
        } else if (downScrollBoundary == defaultDownScrollBoundary) {
          downScrollBoundary = initialBottomPosInViewport;
        }
      }
      // the upScroll part needs work
      else if (initialTopPosInViewport < defaultUpScrollBoundary) {
        if (
          tabTopPosInViewport < defaultUpScrollBoundary &&
          tabTopPosInViewport > upScrollBoundary
        ) {
          upScrollBoundary = tabTopPosInViewport;
        } else if (upScrollBoundary == defaultUpScrollBoundary) {
          upScrollBoundary = initialTopPosInViewport;
        }
      }

      this.scrollBoundary.down = downScrollBoundary;
      this.scrollBoundary.up = upScrollBoundary;
      // console.log(`upScrollBoundary: ${this.scrollBoundary.up}`);

      if (
        tabTopPosInViewport < upScrollBoundary
        // &&
        // tabTopPosInViewport - this.headerHeight <=
        // this.lastTabPos - this.scrollState.specialScrolltop
      ) {
        distance = (tabTopPosInViewport - upScrollBoundary) / 12;
        // console.log(`the scroll distance is ${distance}`);
        if (this.tabListOffset + distance < this.scrollState.scrollTop * -1) {
          distance = (this.scrollState.scrollTop + this.tabListOffset) * -1;
        }
      } else if (
        tabBottomPosInViewport > downScrollBoundary &&
        this.scrollState.scrollTop + this.tabListOffset < this.maxScrollTop
      ) {
        distance = (tabBottomPosInViewport - downScrollBoundary) / 12;
        if (this.tabListOffset + distance > this.maxScrollTop) {
          // distance = this.maxScrollTop % this.tabListOffset;
          distance = this.maxScrollTop - this.tabListOffset;
        }
      }
      // console.log(`the scroll distance is ${distance}`);
      return distance;
    }
  };

  draggedTab.onpointermove = onTabDrag.bind(this);
  draggedTab.onpointerup = onTabDragEnd.bind(this);
  // document.addEventListener("pointerup", onTabDrag, { once: true });
}

module.exports = initializeDrag;
