"use strict";

const adjustMenu = require("./adjustMenu");

function moveTabs(tabIds, direction) {
  const tabsToMove = tabIds.map(id => {
    const index = this.tabIndices[id][0];
    return this.tabs[index];
  });
  // Get unchecked visible tabs
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
  const reorderedVisibleTabIds = [];
  let numCheckedAbove = 0;
  const numCheckedAboveLastUnchecked = this.menuData
    .numCheckedAboveLastUnchecked;
  const reorderedTabObjects = [];
  this.orderedTabObjects.forEach(obj => {
    const id = obj.id;
    tabsInfo[id] = {};
    // if tab is visible
    if (this.tabIndices[id][1] !== null) {
      // if tab is NOT checked
      if (!obj.isChecked) {
        this.tabIndices[id] = [
          this.tabIndices[id][0] - numCheckedAbove,
          this.tabIndices[id][1] - numCheckedAbove
        ];
      } else {
        tabsInfo[id].uncheckedBelowExist =
          lastUncheckedVisibleTabIndices[0] > this.tabIndices[id][0];

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
          numCheckedAbove += 1;
          if (this.filterState.tabs[id]) {
            // replacedTabFilterOffset = this.filterState.tabs[replacedTabId]
            //   .filterOffset;
            this.filterState.tabs[
              id
            ].filterOffset = lastUncheckedVisibleTabFilterOffset;
          }
        }
      }
      reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
    } else {
      // if visible and unchecked tabs exist below
      if (this.tabIndices[id][0] < this.menuData.lastUncheckedVisibleIndex) {
        // if tab is NOT checked
        if (!obj.isChecked) {
          this.tabIndices[id] = [
            this.tabIndices[id][0] - numCheckedAbove,
            null
          ];
        } else {
          this.tabIndices[id] = [
            this.tabIndices[id][0] - numCheckedAbove,
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
  const moveTabsInTheDOM = tabsToMove => {
    const fragmentOfChecked = document.createDocumentFragment();
    this.tabs.forEach(tab => {
      if (this.filterState.tabs[tab.id]) {
        tab.style.setProperty(
          "--y-offset",
          this.filterState.tabs[tab.id].filterOffset + "px"
        );
      }
    });
    tabsToMove.forEach(tab => {
      if (tabsInfo[tab.id].uncheckedBelowExist) {
        fragmentOfChecked.appendChild(tab);
      }
    });

    this.tabList.insertBefore(
      fragmentOfChecked,
      this.tabs[lastUncheckedVisibleTabIndex].nextSibling
    );

    this.tabs = [...this.tabList.children];
  };

  moveTabsInTheDOM(tabsToMove);

  // adjustMenu.call(this);
  // console.log(this.tabs);
}

module.exports = moveTabs;
