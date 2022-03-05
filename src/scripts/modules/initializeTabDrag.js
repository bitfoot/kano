"use strict";
const onDragPointerMove = require("./onDragPointerMove");
const onDragPointerUp = require("./onDragPointerUp");
const getListedTabs = require("./util").getListedTabs;
const resetTransitionVariables = require("./util").resetTransitionVariables;

function initializeTabDrag(event) {
  const draggedTab = event.target.parentElement;
  const pointerPosition = event.pageY;
  const container = this.scrollState.container;
  const bodyHeight = document.body.offsetHeight;
  // disable system scrolling while tab is being dragged
  container.classList.add("tab-list-container--no-scroll");
  const tabList = this.tabList;
  const scrollState = this.scrollState;
  const scrollTop = this.scrollState.scrollTop;
  const maxScrollTop = tabList.offsetHeight - container.offsetHeight;
  const tabListHeight = tabList.offsetHeight;
  const margin = 6;
  const listedTabs = getListedTabs();
  const offsetTops = listedTabs.reduce((a, t) => {
    a[t.id] = t.offsetTop;
    return a;
  }, {});
  const tabIndex = listedTabs.findIndex(t => t.id === draggedTab.id);
  const tabsAbove = listedTabs.slice(0, tabIndex);
  const tabsBelow = listedTabs.slice(tabIndex + 1);
  const headerHeight = document.getElementById("header").offsetHeight;
  const tabHeight = draggedTab.offsetHeight;
  const tabListOffset = 0;
  const initialPosition = offsetTops[draggedTab.id];

  const initialTopPosInViewport =
    initialPosition + headerHeight - scrollState.scrollTop - tabListOffset;
  const initialBottomPosInViewport = initialTopPosInViewport + tabHeight;

  const shiftY = pointerPosition - initialPosition - headerHeight + scrollTop;

  const maxTabPosInList = tabListHeight - margin - tabHeight;

  const minTabPosInList = 0;
  const defaultScrollBoundary = {
    up: 184,
    down: 420
  };

  draggedTab.setPointerCapture(event.pointerId);
  draggedTab.classList.add("tab--draggable");
  draggedTab.classList.remove("tab--held-down");
  resetTransitionVariables.call(this);
  listedTabs
    .filter(t => t.id != draggedTab.id)
    .forEach(t => {
      t.classList.add("tab--moveable", "tab--moving");
    });

  this.dragState = {
    scrollState,
    animation: null,
    scroll: false,
    draggedTab,
    pointerPosition,
    lastPointerPos: pointerPosition,
    headerHeight,
    tabList,
    tabListHeight,
    tabListContainer: container,
    scrollTop,
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
    // this doesn't need validation because dragTab will ensure tabOffset doesn't exceed current max or min
    get tabPosInList() {
      return this.initialPosition + this.tabOffset;
    },
    // get tabPosInViewport() {
    //   const top =
    //     this.tabPosInList -
    //     this.scrollTop -
    //     this.tabListOffset +
    //     this.headerHeight;
    //   const bottom = top + this.tabHeight;
    //   return {
    //     top,
    //     bottom
    //   };
    // },
    get tabPosInViewport() {
      let top =
        this.tabPosInList -
        this.scrollTop -
        this.tabListOffset +
        this.headerHeight;
      const bottom = top + this.tabHeight;
      return {
        top,
        bottom
      };
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
    offsetTops,
    tabMinPosInViewport: headerHeight,
    tabMaxPosInViewport: bodyHeight - margin - tabHeight,
    tabPositionInTheList: 0,
    minTabPosInList,
    maxTabPosInList,
    minTabOffsetInList: offsetTops[draggedTab.id] * -1,
    maxTabOffsetInList: maxTabPosInList - offsetTops[draggedTab.id],
    lastTabPos: initialPosition,
    // get maxOffsetInViewport() {
    //   const maxOffset =
    //     this.maxTabOffsetInList -
    //     this.maxScrollTop +
    //     this.tabListOffset +
    //     this.scrollTop;
    //   return maxOffset;
    // },
    get currentMaxOffset() {
      const maxOffset =
        this.maxTabOffsetInList -
        this.maxScrollTop +
        this.tabListOffset +
        this.scrollTop;
      console.log(
        `CURRENT MAX OFFSET IS ${maxOffset}. Because: maxTabOffsetInList: ${this.maxTabOffsetInList
        }, maxScrollTop: ${this.maxScrollTop}, tabListOffset: ${this.tabListOffset
        }, scrollTop: ${this.scrollTop}`
      );
      return maxOffset;
    },
    get currentMinOffset() {
      const minOffset =
        this.minTabOffsetInList + this.tabListOffset + this.scrollTop;
      return minOffset;
    },

    getScrollDistance() {
      const imaginaryTopPos = this.pointerPosition - this.shiftY;
      const imaginaryBottomPos = imaginaryTopPos + this.tabHeight;

      // const { top, bottom } = this.tabPosInViewport;
      // console.log(`TOP: ${top}, BOTTOM: ${bottom}`);

      /* boundaries may change depending on where the tab is when drag is initiated.
         For example, if user clicks on the last visible tab and initiates drag, because that tab is already well below the default down scroll 
         boundary, the list would start scrolling down very fast if that tab was moved even one pixel. To prevent this, boundary value is adjusted. */

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
        if (imaginaryTopPos < this.scrollBoundary.up) {
          distance = (imaginaryTopPos - this.scrollBoundary.up) / 12;
          if (this.tabListOffset + distance < this.scrollState.scrollTop * -1) {
            distance = (this.scrollState.scrollTop + this.tabListOffset) * -1;
          }
        } else if (
          imaginaryBottomPos > this.scrollBoundary.down &&
          this.scrollState.scrollTop + this.tabListOffset < this.maxScrollTop
        ) {
          distance = (imaginaryBottomPos - this.scrollBoundary.down) / 12;
          if (this.tabListOffset + distance > this.maxScrollTop) {
            distance = this.maxScrollTop - this.tabListOffset;
          }
        }
        return distance;
      };

      return getDistance();
    }
  };

  draggedTab.onpointermove = onDragPointerMove.bind(this);
  draggedTab.onpointerup = onDragPointerUp.bind(this);
}

module.exports = initializeTabDrag;
