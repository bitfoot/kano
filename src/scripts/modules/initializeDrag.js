"use strict";
const onTabDrag = require("./onTabDrag");
const onTabDragEnd = require("./onTabDragEnd");
const getListedTabs = require("./util").getListedTabs;

// this function declares and initializes the variables needed for handling all aspects of dragging a tab
function initializeDrag(event) {
  const tabListContainer = document.getElementById("tab-list-container");
  const tabListScrollTop = this.scrollState.scrollTop;
  const specialScrollTop = this.scrollState.specialScrolltop;
  const tabListContentHeight = this.tabListContentHeight;
  const maxScrollTop =
    tabListContainer.scrollHeight -
    tabListContainer.offsetHeight -
    tabListContentHeight;
  // const maxScrollTop =
  //   tabListContainer.scrollHeight - tabListContainer.offsetHeight;

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
  // draggedTab.scrollIntoView({ behavior: "smooth", block: "end" });
  // const shiftY = event.clientY - draggedTab.getBoundingClientRect().top;
  const shiftY =
    event.clientY -
    initialTabPositions[draggedTab.id] -
    headerHeight +
    specialScrollTop;

  const pointerPosition = event.pageY;
  const maxTabPosition = tabListHeight - margin - draggedTab.offsetHeight;
  const minTabPosition = 0;

  let lastTabPos =
    pointerPosition - shiftY - headerHeight + specialScrollTop + tabListOffset;
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
    headerHeight,
    tabList,
    tabListHeight,
    tabListContainer,
    tabListScrollTop,
    specialScrollTop,
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
      // const position =
      //   this.pointerPosition -
      //   this.shiftY -
      //   this.headerHeight +
      //   this.tabListScrollTop +
      //   this.tabListOffset;

      // const currentMaxOffsetBelow =
      //   this.maxTabOffsetBelow -
      //   this.maxScrollTop +
      //   this.tabListOffset +
      //   this.tabListScrollTop;
      const position =
        this.pointerPosition -
        this.shiftY -
        this.headerHeight +
        this.specialScrollTop +
        this.tabListOffset;

      const currentMaxOffsetBelow =
        this.maxTabOffsetBelow -
        this.maxScrollTop +
        this.tabListOffset +
        this.tabListScrollTop;

      const currentMaxOffsetAbove =
        this.maxTabOffsetAbove + this.tabListOffset + this.specialScrollTop;

      const currentMaxPos = this.initialPosition + currentMaxOffsetBelow;
      const currentMinPos = this.initialPosition + currentMaxOffsetAbove;

      console.log(
        `position: ${position}, currentMaxOffsetBelow: ${currentMaxOffsetBelow}, currentMaxOffsetAbove: ${currentMaxOffsetAbove}, currentMinPos: ${currentMinPos}`
      );
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
    // shouldScroll() {
    //   const tabTopPosInViewport = this.pointerPosition - this.shiftY;
    //   const tabBottomPosInViewport = tabTopPosInViewport + this.tabHeight;
    //   const initialTabBottomPos =
    //     this.initialPosition + this.tabHeight + this.headerHeight;
    //   // console.log(
    //   //   `tabListOffset: ${this.tabListOffset}, maxTabListOffset: ${this.maxTabListOffset
    //   //   }, tabListScrollTop: ${this.tabListScrollTop}`
    //   // );
    //   if (
    //     tabTopPosInViewport < 184 &&
    //     (this.tabListScrollTop > 0 || this.tabListOffset > 0)
    //   ) {
    //     return "up";
    //   } else if (
    //     // check to make sure tabTopPosInViewport is greater than initialTabTopPos. Otherwise it means tab is being dragged up.
    //     tabBottomPosInViewport > initialTabBottomPos &&
    //     tabBottomPosInViewport > 420 &&
    //     this.tabListOffset < this.maxTabListOffset - this.tabListScrollTop &&
    //     this.tabListScrollTop < this.maxScrollTop
    //   ) {
    //     // console.log(
    //     //   `tabBottomPosInViewport: ${tabBottomPosInViewport}, tabTopPosInViewport: ${tabTopPosInViewport}`
    //     // );
    //     return "down";
    //   } else return false;
    // }
    shouldScroll() {
      const tabTopPosInViewport = this.pointerPosition - this.shiftY;
      const tabBottomPosInViewport = tabTopPosInViewport + this.tabHeight;
      const topBoundary = 184;
      const bottomBoundary = 420;
      let distance = 0;

      // console.log(`tabListOffset is ${this.tabListOffset}`);

      if (
        tabTopPosInViewport < topBoundary
        // this.tabListScrollTop + this.tabListOffset > 0
      ) {
        distance = (tabTopPosInViewport - topBoundary) / 12;
        // console.log(`the scroll distance is ${distance}`);
        if (this.tabListOffset + distance < this.specialScrollTop * -1) {
          distance = (this.specialScrollTop + this.tabListOffset) * -1;
        }
      } else if (
        tabBottomPosInViewport > bottomBoundary &&
        this.tabListScrollTop + this.tabListOffset < this.maxScrollTop
      ) {
        console.log(
          `POOO tabListScrollTop: ${this.tabListScrollTop}, specialScrollTop: ${this.specialScrollTop
          }, tabListOffset: ${this.tabListOffset}, maxScrollTop: ${this.maxScrollTop
          }`
        );
        distance = (tabBottomPosInViewport - bottomBoundary) / 12;
        if (this.tabListOffset + distance > this.maxScrollTop) {
          // distance = this.maxScrollTop % this.tabListOffset;
          distance = this.maxScrollTop - this.tabListOffset;
        }
      }
      console.log(`the scroll distance is ${distance}`);
      return distance;
    }
  };

  draggedTab.onpointermove = onTabDrag.bind(this);
  draggedTab.onpointerup = onTabDragEnd.bind(this);
  // document.addEventListener("pointerup", onTabDrag, { once: true });
}

module.exports = initializeDrag;
