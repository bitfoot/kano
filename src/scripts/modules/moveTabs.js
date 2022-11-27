"use strict";

function moveTabs(tabIds, direction) {
  const tabsToMove = tabIds.map(id => {
    const index = this.tabIndices[id][0];
    return this.tabs[index];
  });
  tabsToMove.forEach(t => (t.style.background = "red"));

  // use same animation as during kb drag
  // implement moving without animation at first

  // steps:
  // 1. Get current indices of all visible tabs
  const visibleTabsOldIndices = {};
  this.visibleTabIds.forEach(
    id => (visibleTabsOldIndices[id] = this.tabIndices[id])
  );

  // 1. Get checked visible tabs
  const checkedVisibleTabIds = this.visibleTabIds.filter(id => {
    const obj = this.orderedTabObjects[this.tabIndices[id][0]];
    if (obj.isChecked) {
      return true;
    }
  });

  // 2. Get unchecked visible tabs
  const uncheckedVisibleTabIds = this.visibleTabIds.filter(id => {
    const obj = this.orderedTabObjects[this.tabIndices[id][0]];
    if (!obj.isChecked) {
      return true;
    }
  });
  const lastUncheckedVisibleTabId =
    uncheckedVisibleTabIds[uncheckedVisibleTabIds.length - 1];
  const lastUncheckedVisibleTabIndex = this.tabIndices[
    lastUncheckedVisibleTabId
  ][0];
  const lastUncheckedVisibleTabIndices = this.tabIndices[
    lastUncheckedVisibleTabId
  ];
  let lastUncheckedVisibleTabFilterOffset = 0;
  if (this.filterState.tabs[lastUncheckedVisibleTabId]) {
    lastUncheckedVisibleTabFilterOffset = this.filterState.tabs[
      lastUncheckedVisibleTabId
    ].filterOffset;
  }

  // get info about tabs
  const tabsInfo = {};
  let numCheckedAbove = 0;
  const reorderedTabObjects = [];
  this.orderedTabObjects.forEach((obj, i) => {
    const id = obj.id;
    tabsInfo[id] = {};
    tabsInfo[id].oldIndices = this.tabIndices[id];
    if (!obj.isChecked) {
      if (this.tabIndices[id][1] === null) {
        tabsInfo[id].newIndices = [
          this.tabIndices[id][0] - numCheckedAbove,
          null
        ];
      } else {
        tabsInfo[id].newIndices = [
          this.tabIndices[id][0] - numCheckedAbove,
          this.tabIndices[id][1] - numCheckedAbove
        ];
      }
    } else {
      tabsInfo[id].newIndices = [
        lastUncheckedVisibleTabIndices[0] + numCheckedAbove,
        lastUncheckedVisibleTabIndices[1] + numCheckedAbove
      ];

      console.log(tabsInfo[id].newIndices);
    }

    reorderedTabObjects[tabsInfo[id].newIndices[0]] = obj;

    // tabsInfo[obj.id].numCheckedAbove = numCheckedAbove;
    if (obj.isChecked) {
      numCheckedAbove += 1;
    }
  });

  console.log(this.orderedTabObjects);
  console.log(reorderedTabObjects);

  this.orderedTabObjects = reorderedTabObjects;

  // move tabs in the DOM
  const fragmentOfChecked = document.createDocumentFragment();
  tabsToMove.forEach(tab => {
    if (this.filterState.tabs[tab.id]) {
      this.filterState.tabs[
        tab.id
      ].filterOffset = lastUncheckedVisibleTabFilterOffset;
      tab.style.setProperty(
        "--y-offset",
        lastUncheckedVisibleTabFilterOffset + "px"
      );
    }
    fragmentOfChecked.appendChild(tab);
  });

  this.tabList.insertBefore(
    fragmentOfChecked,
    this.tabs[lastUncheckedVisibleTabIndex].nextSibling
  );

  this.tabs = [...this.tabList.children];
  // console.log(this.tabs);
}

module.exports = moveTabs;
