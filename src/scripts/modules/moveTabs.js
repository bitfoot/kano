"use strict";

function moveTabs(direction) {
  const checkedVisibleTabs = this.menuData.checkedVisibleTabs;

  const lastUncheckedVisibleTabId = this.orderedTabObjects[
    this.menuData.lastUncheckedVisibleIndex
  ].id;
  const lastUncheckedVisibleTabIndices = this.tabIndices[
    lastUncheckedVisibleTabId
  ];

  const firstUncheckedVisibleTabId = this.orderedTabObjects[
    this.menuData.firstUncheckedVisibleIndex
  ].id;
  const firstUncheckedVisibleTabIndices = this.tabIndices[
    firstUncheckedVisibleTabId
  ];

  let lastUncheckedVisibleTabFilterOffset = 0;
  if (this.filterState.tabs[lastUncheckedVisibleTabId]) {
    lastUncheckedVisibleTabFilterOffset = this.filterState.tabs[
      lastUncheckedVisibleTabId
    ].filterOffset;
  }

  let firstUncheckedVisibleTabFilterOffset = 0;
  if (this.filterState.tabs[firstUncheckedVisibleTabId]) {
    firstUncheckedVisibleTabFilterOffset = this.filterState.tabs[
      firstUncheckedVisibleTabId
    ].filterOffset;
  }

  // get info about tabs
  const tabsInfo = {};
  const reorderedVisibleTabIds = [];
  let numCheckedAbove = 0;
  let numUncheckedAbove = 0;
  let numCheckedBelowFirstUnchecked = 0;
  const numCheckedAboveLastUnchecked = this.menuData
    .numCheckedAboveLastUnchecked;
  const reorderedTabObjects = [];

  this.orderedTabObjects.forEach(obj => {
    const id = obj.id;
    tabsInfo[id] = {};

    if (direction === "bottom") {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        // if tab is NOT checked
        if (obj.isChecked === false) {
          this.tabIndices[id] = [
            this.tabIndices[id][0] - numCheckedAbove,
            this.tabIndices[id][1] - numCheckedAbove
          ];
          numUncheckedAbove += 1;
        } else {
          // if tab IS checked
          tabsInfo[id].uncheckedBelowExist =
            this.tabIndices[id][0] < lastUncheckedVisibleTabIndices[0];

          if (tabsInfo[id].uncheckedBelowExist) {
            this.tabIndices[id] = [
              lastUncheckedVisibleTabIndices[0] +
              1 -
              numCheckedAboveLastUnchecked +
              numCheckedAbove,
              lastUncheckedVisibleTabIndices[1] +
              1 -
              numCheckedAboveLastUnchecked +
              numCheckedAbove
            ];

            if (this.filterState.tabs[id]) {
              this.filterState.tabs[
                id
              ].filterOffset = lastUncheckedVisibleTabFilterOffset;
            }
          }
          numCheckedAbove += 1;
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        // if visible and unchecked tabs exist below
        if (this.tabIndices[id][0] < this.menuData.lastUncheckedVisibleIndex) {
          this.tabIndices[id] = [
            this.tabIndices[id][0] - numCheckedAbove,
            null
          ];
        }
      }
    } else {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        // if tab is NOT checked
        if (obj.isChecked === false) {
          const numCheckedBelow = this.menuData.numChecked - numCheckedAbove;
          this.tabIndices[id] = [
            this.tabIndices[id][0] + numCheckedBelow,
            this.tabIndices[id][1] + numCheckedBelow
          ];
          numUncheckedAbove += 1;
        } else {
          // if tab IS checked
          tabsInfo[id].uncheckedAboveExist = numUncheckedAbove > 0;
          const currentTabBrowserIndex = this.tabIndices[id][0];

          if (tabsInfo[id].uncheckedAboveExist) {
            this.tabIndices[id] = [
              firstUncheckedVisibleTabIndices[0] +
              numCheckedBelowFirstUnchecked,
              firstUncheckedVisibleTabIndices[1] + numCheckedBelowFirstUnchecked
            ];

            if (this.filterState.tabs[id]) {
              this.filterState.tabs[
                id
              ].filterOffset = firstUncheckedVisibleTabFilterOffset;
            }
          }
          numCheckedAbove += 1;
          if (currentTabBrowserIndex > firstUncheckedVisibleTabIndices[0]) {
            numCheckedBelowFirstUnchecked += 1;
          }
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        // if visible and unchecked tabs exist below
        if (this.tabIndices[id][0] > this.menuData.firstUncheckedVisibleIndex) {
          const numCheckedBelow = this.menuData.numChecked - numCheckedAbove;
          this.tabIndices[id] = [
            this.tabIndices[id][0] + numCheckedBelow,
            null
          ];
        }
      }
    }
    reorderedTabObjects[this.tabIndices[id][0]] = obj;
  });

  console.log(this.orderedTabObjects);
  console.log(reorderedTabObjects);

  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = reorderedVisibleTabIds;

  // move tabs in the DOM
  const moveTabsInTheDOM = (tabsToMove, direction) => {
    const fragmentOfChecked = document.createDocumentFragment();
    this.tabs.forEach(tab => {
      if (this.filterState.tabs[tab.id]) {
        tab.style.setProperty(
          "--y-offset",
          this.filterState.tabs[tab.id].filterOffset + "px"
        );
      }
    });

    if (direction === "bottom") {
      tabsToMove.forEach(tab => {
        if (tabsInfo[tab.id].uncheckedBelowExist) {
          fragmentOfChecked.appendChild(tab);
        }
      });
      this.tabList.insertBefore(
        fragmentOfChecked,
        this.tabs[lastUncheckedVisibleTabIndices[0]].nextSibling
      );
    } else {
      tabsToMove.forEach(tab => {
        if (tabsInfo[tab.id].uncheckedAboveExist) {
          fragmentOfChecked.appendChild(tab);
        }
      });
      this.tabList.insertBefore(
        fragmentOfChecked,
        this.tabs[firstUncheckedVisibleTabIndices[0]]
      );
    }

    this.tabs = [...this.tabList.children];
  };

  moveTabsInTheDOM(checkedVisibleTabs, direction);
}

module.exports = moveTabs;
