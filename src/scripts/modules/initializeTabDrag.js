"use strict";
const onTabDragPointerMove = require("./onTabDragPointerMove");
const onTabDragPointerUp = require("./onTabDragPointerUp");
const resetTransitionVariables = require("./util").resetTransitionVariables;

function initializeTabDrag(event) {
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
  const headerHeight = document.getElementById("header").offsetHeight;
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

  const tabIndex = state.tabIndices[draggedTab.id];
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
    tabsPosInfo,
    scrollState,
    animation: null,
    scroll: false,
    draggedTab,
    pointerPosition,
    // lastPointerPos: pointerPosition,
    get imaginaryTopPos() {
      return this.pointerPosition - this.shiftY;
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
        if (imaginaryTopPos < this.scrollBoundary.up) {
          distance = (imaginaryTopPos - this.scrollBoundary.up) / 12;
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
          distance = (imaginaryBottomPos - this.scrollBoundary.down) / 12;
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

  draggedTab.onpointermove = onTabDragPointerMove.bind(this);
  draggedTab.onpointerup = onTabDragPointerUp.bind(this);
}
// function initializeTabDrag(event) {
//   const state = this;
//   const draggedTab = event.target.parentElement;
//   const pointerPosition = event.pageY;
//   const container = this.scrollState.container;
//   const bodyHeight = document.body.offsetHeight;
//   // disable system scrolling while tab is being dragged
//   container.classList.add("tab-list-container--no-scroll");
//   const tabList = this.tabList;
//   const scrollState = this.scrollState;
//   const scrollTop = this.scrollState.scrollTop;
//   const tabListHeight = tabList.offsetHeight;

//   let wholeContentHeight = null;
//   const filterWasUsed = state.filterState.numOfFilteredTabs !== null;
//   if (filterWasUsed) {
//     wholeContentHeight = state.filterState.numOfFilteredTabs * 46;
//   } else {
//     wholeContentHeight = state.orderedTabObjects.length * 46;
//   }
//   // const maxScrollTop = tabListHeight - container.offsetHeight;
//   let maxScrollTop = wholeContentHeight - container.offsetHeight;
//   if (maxScrollTop < 0) {
//     maxScrollTop = 0;
//   }

//   const margin = 6;
//   const listedTabs = state.tabs;

//   const tabsPosInfo = listedTabs.reduce((a, t) => {
//     const offsetTop = t.offsetTop;
//     const dragOffset = 0;
//     let filterOffset = 0;
//     if (this.filterState.tabs[t.id]) {
//       filterOffset = state.filterState.tabs[t.id].filterOffset;
//     }
//     const initialPos = offsetTop + filterOffset;

//     a[t.id] = {
//       offsetTop,
//       filterOffset,
//       initialPos,
//       dragOffset
//     };

//     return a;
//   }, {});

//   const tabIndex = state.tabIndices[draggedTab.id];
//   const tabsAbove = listedTabs.slice(0, tabIndex);
//   const tabsBelow = listedTabs.slice(tabIndex + 1);
//   const headerHeight = document.getElementById("header").offsetHeight;
//   const tabHeight = draggedTab.offsetHeight;
//   const tabListOffset = 0;
//   const initialTabPos = tabsPosInfo[draggedTab.id].initialPos;

//   const initialTopPosInViewport =
//     initialTabPos + headerHeight - scrollState.scrollTop - tabListOffset;
//   const initialBottomPosInViewport = initialTopPosInViewport + tabHeight;

//   const shiftY = pointerPosition - initialTabPos - headerHeight + scrollTop;
//   // const maxTabPosInList = tabListHeight - margin - tabHeight;
//   const maxTabPosInList = wholeContentHeight - margin - tabHeight;
//   const minTabPosInList = 0;
//   const minTabOffsetInList = initialTabPos * -1;
//   const maxTabOffsetInList = maxTabPosInList - initialTabPos;

//   const defaultScrollBoundary = {
//     up: 184,
//     down: 420
//   };

//   draggedTab.setPointerCapture(event.pointerId);
//   draggedTab.classList.add("tab--draggable");
//   draggedTab.classList.remove("tab--held-down");
//   resetTransitionVariables.call(this);
//   listedTabs
//     .filter(t => t.id != draggedTab.id)
//     .forEach(t => {
//       t.classList.add("tab--moveable", "tab--moving");
//     });

//   this.dragState = {
//     tabsPosInfo,
//     scrollState,
//     animation: null,
//     scroll: false,
//     draggedTab,
//     pointerPosition,
//     // lastPointerPos: pointerPosition,
//     get imaginaryTopPos() {
//       return this.pointerPosition - this.shiftY;
//     },
//     headerHeight,
//     tabList,
//     tabListHeight,
//     tabListContainer: container,
//     scrollTop,
//     initialTabPos,
//     initialPosInViewport: {
//       top: initialTopPosInViewport,
//       bottom: initialBottomPosInViewport
//     },
//     defaultScrollBoundary,
//     scrollBoundary: {
//       up: defaultScrollBoundary.up,
//       down: defaultScrollBoundary.down
//     },

//     get tabPosInList() {
//       return this.initialTabPos + this.tabsPosInfo[draggedTab.id].dragOffset;
//     },

//     get tabPosInViewport() {
//       let top =
//         this.tabPosInList -
//         this.scrollTop -
//         this.tabListOffset +
//         this.headerHeight;
//       const bottom = top + this.tabHeight;
//       return {
//         top,
//         bottom
//       };
//     },
//     maxScrollTop,
//     tabListOffset,
//     maxTabListOffset: maxScrollTop,
//     margin,
//     tabHeight,
//     shiftY,
//     listedTabs,
//     tabIndex,
//     tabsAbove,
//     tabsBelow,
//     tabMinPosInViewport: headerHeight,
//     tabMaxPosInViewport: bodyHeight - margin - tabHeight,
//     tabPositionInTheList: 0,
//     minTabPosInList,
//     maxTabPosInList,
//     minTabOffsetInList,
//     maxTabOffsetInList,
//     lastTabPos: initialTabPos,
//     get currentMaxOffset() {
//       const maxOffset =
//         this.maxTabOffsetInList -
//         this.maxScrollTop +
//         this.tabListOffset +
//         this.scrollTop;

//       return maxOffset;
//     },
//     get currentMinOffset() {
//       const minOffset =
//         this.minTabOffsetInList + this.tabListOffset + this.scrollTop;
//       return minOffset;
//     },

//     getScrollDistance() {
//       const imaginaryTopPos = this.imaginaryTopPos;
//       const imaginaryBottomPos = imaginaryTopPos + this.tabHeight;

//       const updateScrollBoundary = () => {
//         const initialTopPosInViewport = this.initialPosInViewport.top;
//         const initialBottomPosInViewport = this.initialPosInViewport.bottom;
//         const defaultUpScrollBoundary = this.defaultScrollBoundary.up;
//         const defaultDownScrollBoundary = this.defaultScrollBoundary.down;

//         if (initialTopPosInViewport < defaultUpScrollBoundary) {
//           if (
//             imaginaryTopPos < defaultUpScrollBoundary &&
//             imaginaryTopPos > this.scrollBoundary.up
//           ) {
//             this.scrollBoundary.up = imaginaryTopPos;
//           } else if (this.scrollBoundary.up == defaultUpScrollBoundary) {
//             this.scrollBoundary.up = initialTopPosInViewport;
//           }
//         } else if (initialBottomPosInViewport > defaultDownScrollBoundary) {
//           if (
//             imaginaryBottomPos > defaultDownScrollBoundary &&
//             imaginaryBottomPos < this.scrollBoundary.down
//           ) {
//             this.scrollBoundary.down = imaginaryBottomPos;
//           } else if (this.scrollBoundary.down == defaultDownScrollBoundary) {
//             this.scrollBoundary.down = initialBottomPosInViewport;
//           }
//         }
//       };

//       updateScrollBoundary();

//       const getDistance = () => {
//         let distance = 0;
//         if (imaginaryTopPos < this.scrollBoundary.up) {
//           distance = (imaginaryTopPos - this.scrollBoundary.up) / 12;
//           if (this.tabListOffset + distance < this.scrollState.scrollTop * -1) {
//             distance = (this.scrollState.scrollTop + this.tabListOffset) * -1;
//           }
//         } else if (
//           imaginaryBottomPos > this.scrollBoundary.down &&
//           this.scrollState.scrollTop + this.tabListOffset < this.maxScrollTop
//         ) {
//           distance = (imaginaryBottomPos - this.scrollBoundary.down) / 12;
//           if (this.tabListOffset + distance > this.maxScrollTop) {
//             distance = this.maxScrollTop - this.tabListOffset;
//           }
//         }
//         return distance;
//       };

//       return getDistance();
//     }
//   };

//   draggedTab.onpointermove = onTabDragPointerMove.bind(this);
//   draggedTab.onpointerup = onTabDragPointerUp.bind(this);
// }

module.exports = initializeTabDrag;
