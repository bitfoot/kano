"use strict";

// function moveTabs(direction) {
//   const checkedVisibleTabs = this.menuData.checkedVisibleTabs;

//   const lastUncheckedVisibleTabId = this.orderedTabObjects[
//     this.menuData.lastUncheckedVisibleIndex
//   ].id;
//   const lastUncheckedVisibleTabIndices = this.tabIndices[
//     lastUncheckedVisibleTabId
//   ];

//   const firstUncheckedVisibleTabId = this.orderedTabObjects[
//     this.menuData.firstUncheckedVisibleIndex
//   ].id;
//   const firstUncheckedVisibleTabIndices = this.tabIndices[
//     firstUncheckedVisibleTabId
//   ];

//   let lastUncheckedVisibleTabFilterOffset = 0;
//   if (this.filterState.tabs[lastUncheckedVisibleTabId]) {
//     lastUncheckedVisibleTabFilterOffset = this.filterState.tabs[
//       lastUncheckedVisibleTabId
//     ].filterOffset;
//   }

//   let firstUncheckedVisibleTabFilterOffset = 0;
//   if (this.filterState.tabs[firstUncheckedVisibleTabId]) {
//     firstUncheckedVisibleTabFilterOffset = this.filterState.tabs[
//       firstUncheckedVisibleTabId
//     ].filterOffset;
//   }

//   // get info about tabs
//   const tabsInfo = {};
//   const reorderedVisibleTabIds = [];
//   let numCheckedAbove = 0;
//   let numUncheckedAbove = 0;
//   let numCheckedBelowFirstUnchecked = 0;
//   const uncheckedExistBelowFirstChecked =
//     this.menuData.firstCheckedVisibleIndex !== null &&
//     this.menuData.firstCheckedVisibleIndex < lastUncheckedVisibleTabIndices[0];

//   const hiddenExistBelowFirstChecked =
//     this.menuData.lastHiddenTabIndex !== null &&
//     this.menuData.lastHiddenTabIndex > this.menuData.firstCheckedVisibleIndex;

//   const numCheckedAboveLastUnchecked = this.menuData
//     .numCheckedAboveLastUnchecked;
//   const reorderedTabObjects = [];

//   this.orderedTabObjects.forEach(obj => {
//     const id = obj.id;
//     tabsInfo[id] = {};

//     if (direction === "bottom") {
//       // if tab is visible
//       if (this.tabIndices[id][1] !== null) {
//         // if tab is NOT checked
//         if (obj.isChecked === false) {
//           this.tabIndices[id] = [
//             this.tabIndices[id][0] - numCheckedAbove,
//             this.tabIndices[id][1] - numCheckedAbove
//           ];
//           numUncheckedAbove += 1;
//         } else {
//           // if tab IS checked
//           tabsInfo[id].uncheckedBelowExist =
//             this.tabIndices[id][0] < lastUncheckedVisibleTabIndices[0];

//           tabsInfo[id].hiddenBelowExist;

//           if (tabsInfo[id].uncheckedBelowExist) {
//             this.tabIndices[id] = [
//               lastUncheckedVisibleTabIndices[0] +
//               1 -
//               numCheckedAboveLastUnchecked +
//               numCheckedAbove,
//               lastUncheckedVisibleTabIndices[1] +
//               1 -
//               numCheckedAboveLastUnchecked +
//               numCheckedAbove
//             ];

//             if (this.filterState.tabs[id]) {
//               this.filterState.tabs[
//                 id
//               ].filterOffset = lastUncheckedVisibleTabFilterOffset;
//             }
//           } else if (
//             this.menuData.firstCheckedVisibleIndex >
//             lastUncheckedVisibleTabIndices[0]
//           ) {
//             const numCheckedBelow =
//               this.menuData.numChecked - numCheckedAbove - 1;
//             console.log(
//               `lastHiddenTabIndex: ${this.menuData.lastHiddenTabIndex
//               }, numCheckedBelow: ${numCheckedBelow}`
//             );
//             this.tabIndices[id] = [
//               this.menuData.lastHiddenTabIndex - numCheckedBelow,
//               this.menuData.lastHiddenTabIndex - numCheckedBelow
//             ];

//             if (this.filterState.tabs[id]) {
//               this.filterState.tabs[id].filterOffset = 0;
//             }
//           }
//           numCheckedAbove += 1;
//         }
//         reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
//       } else {
//         // if tab is hidden
//         // if visible and unchecked tabs exist below
//         if (this.tabIndices[id][0] < this.menuData.lastUncheckedVisibleIndex) {
//           this.tabIndices[id] = [
//             this.tabIndices[id][0] - numCheckedAbove,
//             null
//           ];
//         } else if (this.tabIndices[id][0] <= this.menuData.lastHiddenTabIndex) {
//           // this.tabIndices[id] = [
//           //   this.tabIndices[id][0] - numCheckedAbove,
//           //   null
//           // ];
//         }
//       }
//     } else {
//       // if tab is visible
//       if (this.tabIndices[id][1] !== null) {
//         // if tab is NOT checked
//         if (obj.isChecked === false) {
//           const numCheckedBelow = this.menuData.numChecked - numCheckedAbove;
//           this.tabIndices[id] = [
//             this.tabIndices[id][0] + numCheckedBelow,
//             this.tabIndices[id][1] + numCheckedBelow
//           ];
//           numUncheckedAbove += 1;
//         } else {
//           // if tab IS checked
//           tabsInfo[id].uncheckedAboveExist = numUncheckedAbove > 0;
//           const currentTabBrowserIndex = this.tabIndices[id][0];

//           if (tabsInfo[id].uncheckedAboveExist) {
//             this.tabIndices[id] = [
//               firstUncheckedVisibleTabIndices[0] +
//               numCheckedBelowFirstUnchecked,
//               firstUncheckedVisibleTabIndices[1] + numCheckedBelowFirstUnchecked
//             ];

//             if (this.filterState.tabs[id]) {
//               this.filterState.tabs[
//                 id
//               ].filterOffset = firstUncheckedVisibleTabFilterOffset;
//             }
//           }
//           numCheckedAbove += 1;
//           if (currentTabBrowserIndex > firstUncheckedVisibleTabIndices[0]) {
//             numCheckedBelowFirstUnchecked += 1;
//           }
//         }
//         reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
//       } else {
//         // if tab is hidden
//         // if visible and unchecked tabs exist below
//         if (this.tabIndices[id][0] > this.menuData.firstUncheckedVisibleIndex) {
//           const numCheckedBelow = this.menuData.numChecked - numCheckedAbove;
//           this.tabIndices[id] = [
//             this.tabIndices[id][0] + numCheckedBelow,
//             null
//           ];
//         }
//       }
//     }
//     reorderedTabObjects[this.tabIndices[id][0]] = obj;
//   });

function moveTabs(direction) {
  const checkedVisibleTabs = this.menuData.checkedVisibleTabs;
  const lastTabIndex = this.orderedTabObjects.length - 1;
  const numHiddenTabs =
    this.orderedTabObjects.length - this.visibleTabIds.length;
  const movedTabFilterOffset = direction === "bottom" ? numHiddenTabs * -46 : 0;
  let numCheckedAbove = 0;
  let numUncheckedAbove = 0;

  // get info about tabs
  const tabsInfo = {};
  const reorderedVisibleTabIds = [];
  const reorderedTabObjects = [];

  this.orderedTabObjects.forEach(obj => {
    const id = obj.id;
    // tabsInfo[id] = {
    //   distance: null
    // };

    if (direction === "bottom") {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        tabsInfo[id] = {};
        // if tab is NOT checked
        if (obj.isChecked === false) {
          this.tabIndices[id] = [
            this.tabIndices[id][0] - numCheckedAbove,
            this.tabIndices[id][1] - numCheckedAbove
          ];
          tabsInfo[id].distance = numCheckedAbove * -46;
          numUncheckedAbove += 1;
        } else {
          // if tab IS checked
          const numCheckedBelow =
            this.menuData.numChecked - numCheckedAbove - 1;
          const numUncheckedBelow =
            this.menuData.numUnchecked - numUncheckedAbove;

          this.tabIndices[id] = [
            lastTabIndex - numCheckedBelow,
            this.tabIndices[id][1] + numUncheckedBelow
          ];
          if (this.filterState.tabs[id]) {
            this.filterState.tabs[id].filterOffset = movedTabFilterOffset;
          }
          tabsInfo[id].distance = numUncheckedBelow * 46;
          numCheckedAbove += 1;
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        this.tabIndices[id][0] -= numCheckedAbove;
      }
    } else {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        tabsInfo[id] = {};
        // if tab is NOT checked
        if (obj.isChecked === false) {
          const numCheckedBelow = this.menuData.numChecked - numCheckedAbove;
          this.tabIndices[id] = [
            this.tabIndices[id][0] + numCheckedBelow,
            this.tabIndices[id][1] + numCheckedBelow
          ];
          tabsInfo[id].distance = numCheckedBelow * 46;
          numUncheckedAbove += 1;
        } else {
          // if tab IS checked
          this.tabIndices[id] = [numCheckedAbove, numCheckedAbove];

          if (this.filterState.tabs[id]) {
            this.filterState.tabs[id].filterOffset = 0;
          }
          tabsInfo[id].distance = numUncheckedAbove * -46;
          numCheckedAbove += 1;
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        const numCheckedBelow = this.menuData.numChecked - numCheckedAbove;
        this.tabIndices[id][0] += numCheckedBelow;
      }
    }
    reorderedTabObjects[this.tabIndices[id][0]] = obj;
  });

  // console.log(this.orderedTabObjects);
  // console.log(reorderedTabObjects);
  console.log(tabsInfo);

  // move tabs in the DOM
  const moveTabsInTheDOM = (tabsToMove, direction) => {
    const fragmentOfChecked = document.createDocumentFragment();

    tabsToMove.forEach(tab => {
      fragmentOfChecked.appendChild(tab);
    });

    if (direction === "bottom") {
      const lastIndex = this.orderedTabObjects.length - 1;

      this.tabList.insertBefore(
        fragmentOfChecked,
        this.tabs[lastIndex].nextSibling
      );
    } else {
      this.tabList.insertBefore(fragmentOfChecked, this.tabList.firstChild);
    }

    this.tabs = [...this.tabList.children];

    this.visibleTabIds.forEach(id => {
      const index = this.tabIndices[id][0];
      const tab = this.tabs[index];
      if (this.filterState.tabs[id]) {
        tab.style.setProperty(
          "--y-offset",
          this.filterState.tabs[id].filterOffset + "px"
        );
      }
    });
  };

  moveTabsInTheDOM(checkedVisibleTabs, direction);
  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = reorderedVisibleTabIds;
}

module.exports = moveTabs;
