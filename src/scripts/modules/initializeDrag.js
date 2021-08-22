"use strict";
const onTabDrag = require("./onTabDrag");
const onTabDragEnd = require("./onTabDragEnd");
const getListedTabs = require("./util").getListedTabs;

// this function declares and initializes the variables needed for handling all aspects of dragging a tab
function initializeDrag(event) {
  const tabListContainer = document.getElementById("tab-list-container");
  const tabListScrollTop = this.scrollTop;
  const maxScrollTop =
    tabListContainer.scrollHeight - tabListContainer.offsetHeight;
  const tabList = document.getElementById("tab-list");
  const tabListHeight = tabList.offsetHeight;
  const margin = 6;
  // tabListContainer.style.setProperty("--scrolltop", tabListScrollTop);
  const listedTabs = getListedTabs();
  const initialTabPositions = listedTabs.reduce((a, t) => {
    a[t.id] = t.offsetTop;
    return a;
  }, {});
  const headerHeight = document.getElementById("header").offsetHeight;
  const tabListOffset = 0;
  const draggedTab = event.target.parentElement;
  // const shiftY = event.clientY - draggedTab.getBoundingClientRect().top;
  const shiftY =
    event.clientY -
    initialTabPositions[draggedTab.id] -
    headerHeight +
    tabListScrollTop;
  const pointerPosition = event.pageY;
  const draggedTabPosition = pointerPosition - shiftY;
  const tabTopPosInViewport = pointerPosition - shiftY;
  const maxTabPosition = tabListHeight - margin - draggedTab.offsetHeight;
  const minTabPosition = 0;
  let lastTabPos =
    pointerPosition - shiftY - headerHeight + tabListScrollTop + tabListOffset;
  // lastTabPos = Math.min(maxTabPosition, Math.max(minTabPosition, lastTabPos));
  const tabIndex = listedTabs.findIndex(t => t.id === draggedTab.id);
  const tabsAbove = listedTabs.slice(0, tabIndex);
  const tabsBelow = listedTabs.slice(tabIndex + 1);
  draggedTab.setPointerCapture(event.pointerId);
  draggedTab.classList.add("tab-list-item--draggable");
  draggedTab.classList.remove("tab-list-item--held-down");
  listedTabs
    .filter(t => t.id != draggedTab.id)
    .forEach(t => {
      t.classList.add("tab-list-item--moveable", "tab-list-item--moving");
    });

  // this is normal
  console.log(
    `pointerPosition: ${pointerPosition}, shiftY: ${shiftY}, headerHeight: ${headerHeight}, tabListScrollTop: ${tabListScrollTop}, tabListOffset: ${tabListOffset}, lastTabPos: ${lastTabPos}`
  );

  this.dragState = {
    animation: null,
    scroll: false,
    draggedTab,
    pointerPosition,
    draggedTabPosition,
    headerHeight,
    tabList,
    tabListHeight,
    tabListContainer,
    tabListScrollTop,
    initialPosition: initialTabPositions[draggedTab.id],
    maxScrollTop,
    tabOffset: 0,
    tabListOffset,
    maxTabListOffset: maxScrollTop,
    margin,
    tabHeight: 40,
    shiftY,
    listedTabs,
    tabIndex,
    tabsAbove,
    tabsBelow,
    initialTabPositions,
    tabTopPosInViewport,
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
    getTabOffset() {
      const maxOffsetBelowNow = this.maxTabOffsetBelow - this.tabListOffset;
      console.log(
        `tabListOffset: ${this.tabListOffset
        }, maxOffsetBelowNow: ${maxOffsetBelowNow}`
      );
      // const tabListOffset
    },
    getTabPos() {
      // this function calculates updated 'offsetTop' position of dragged tab
      // get tab offset
      // console.log(
      //   `Intial offsetTop: ${this.initialPosition}, newOffsetTop: ${this
      //     .initialPosition + this.tabOffset}`
      // );

      console.log(
        `pointer position: ${this.pointerPosition -
        this.shiftY -
        this.headerHeight}, newOffsetTop: ${this.initialPosition +
        this.tabOffset}`
      );
    },
    lastPointerPos: null,
    getUpdatedTabPos() {
      // console.log(
      //   `pointerPosition: ${ this.pointerPosition }, shiftY: ${
      // this.shiftY;
      //   }, headerHeight: ${this.headerHeight}, tabListScrollTop: ${this.tabListScrollTop
      //   }, tabListOffset: ${this.tabListOffset}`
      // );
      const position =
        this.pointerPosition -
        this.shiftY -
        this.headerHeight +
        this.tabListScrollTop +
        this.tabListOffset;
      // const position =
      //   this.initialPosition +
      //   this.tabOffset +
      //   this.tabListScrollTop +
      //   this.tabListOffset;

      // console.log(this.tabListScrollTop, this.tabListOffset);
      // console.log(`offset: ${this.tabOffset}`);

      const correctedPosition = Math.min(
        this.maxTabPosition,
        Math.max(this.minTabPosition, position)
      );

      return correctedPosition;
    },
    shouldScroll() {
      const tabTopPosInViewport = this.pointerPosition - this.shiftY;
      const tabBottomPosInViewport = tabTopPosInViewport + this.tabHeight;
      const initialTabBottomPos =
        this.initialPosition + this.tabHeight + this.headerHeight;
      console.log(
        `tabListOffset: ${this.tabListOffset}, maxTabListOffset: ${this.maxTabListOffset
        }, tabListScrollTop: ${this.tabListScrollTop}`
      );
      if (tabTopPosInViewport < 184 && this.tabListOffset > 0) {
        return "up";
      } else if (
        // check to make sure tabTopPosInViewport is greater than initialTabTopPos. Otherwise it means tab is being dragged up.
        tabBottomPosInViewport > initialTabBottomPos &&
        tabBottomPosInViewport > 420 &&
        this.tabListOffset < this.maxTabListOffset - this.tabListScrollTop &&
        // this.tabListOffset < this.maxTabListOffset &&
        this.tabListScrollTop < this.maxScrollTop
      ) {
        // console.log(
        //   `tabBottomPosInViewport: ${tabBottomPosInViewport}, tabTopPosInViewport: ${tabTopPosInViewport}`
        // );
        console.log(
          `scrolling down for some fucking reason, even though tabListOffset is ${this.tabListOffset
          } and maxTabListOffset - scrollTop is ${this.maxTabListOffset -
          this.tabListScrollTop}`
        );
        return "down";
      } else return false;
    }
    // getScrollSpeed() {
    //   const difference = this.draggedTabPosition - 426;
    //   if (difference < 10) {
    //     return "1000ms";
    //   } else if (difference < 30) {
    //     return "600ms";
    //   } else {
    //     return "200ms";
    //   }
    // }
  };

  draggedTab.onpointermove = onTabDrag.bind(this);
  draggedTab.onpointerup = onTabDragEnd.bind(this);
  // document.addEventListener("pointerup", onTabDrag, { once: true });
}

module.exports = initializeDrag;
