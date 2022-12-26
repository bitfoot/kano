"use strict";

const easeInOutQuad = require("./util").easeInOutQuad;
const easeInQuad = require("./util").easeInQuad;
const disableOrEnableControls = require("./util").disableOrEnableControls;
const adjustMenu = require("./adjustMenu");

function moveTabs(direction) {
  const tabHeight = 40;
  const margin = 6;
  const tabRowHeight = tabHeight + margin;
  const checkedVisibleTabs = this.menuData.checkedVisibleTabs;
  const lastTabIndex = this.orderedTabObjects.length - 1;
  const numHiddenTabs =
    this.orderedTabObjects.length - this.visibleTabIds.length;
  const movedTabFilterOffset =
    direction === "bottom" ? numHiddenTabs * tabRowHeight * -1 : 0;
  let numCheckedAbove = 0;
  let numUncheckedAbove = 0;

  disableOrEnableControls.call(this, { disable: true });

  // get info about tabs
  this.moveState = {
    lastTabIndex,
    tabRowHeight,
    checkedVisibleTabs,
    direction,
    moveTabsInTheDOM: function (tabsToMove) {
      const fragmentOfChecked = document.createDocumentFragment();

      tabsToMove.forEach(tab => {
        fragmentOfChecked.appendChild(tab);
      });

      let tabToInsertBefore;
      if (this.moveState.direction === "bottom") {
        tabToInsertBefore = this.tabList.lastChild.nextSibling;
      } else {
        tabToInsertBefore = this.tabList.firstChild;
      }

      window.requestAnimationFrame(() => {
        this.tabList.insertBefore(fragmentOfChecked, tabToInsertBefore);
        this.tabs = [...this.tabList.children];
      });
    }.bind(this)
  };

  const reorderedVisibleTabIds = [];
  const reorderedTabObjects = [];

  this.orderedTabObjects.forEach((obj, index) => {
    const id = obj.id;

    if (direction === "bottom") {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        // if tab is NOT checked
        if (obj.isChecked === false) {
          numUncheckedAbove += 1;
          // if no checked tabs exist above, there's no need to do anything else for this tab

          if (numCheckedAbove > 0) {
            this.tabIndices[id] = [
              this.tabIndices[id][0] - numCheckedAbove,
              this.tabIndices[id][1] - numCheckedAbove
            ];
            const distanceToMove = numCheckedAbove * tabRowHeight * -1;
            const tab = this.tabs[index];
            window.requestAnimationFrame(() => {
              tab.style.setProperty("--moved-offset", distanceToMove + "px");
              tab.classList.add("tab--peach");
            });
          }

          // lastVisibleIsChecked = false;
        } else {
          // if tab IS checked
          const numCheckedBelow =
            this.menuData.numChecked - numCheckedAbove - 1;
          const numUncheckedBelow =
            this.menuData.numUnchecked - numUncheckedAbove;

          const tab = this.tabs[index];
          if (numCheckedAbove === 0) {
            tab.onanimationend = e => {
              if (e.animationName === "moving") {
                tab.onanimationend = "";

                // animate tab movement, then move tabs in the DOM
                this.visibleTabIds.forEach(id => {
                  const tab = document.getElementById(id);
                  let newOffset = 0;
                  if (this.filterState.tabs[id]) {
                    newOffset = this.filterState.tabs[id].filterOffset;
                  }

                  window.requestAnimationFrame(() => {
                    tab.classList.remove("tab--banana");
                    tab.classList.remove("tab--peach");
                    tab.style.setProperty("--y-offset", newOffset + "px");
                  });
                });

                this.moveState.moveTabsInTheDOM(
                  this.moveState.checkedVisibleTabs
                );

                // enable menu buttons and filter
                disableOrEnableControls.call(this, { disable: false });
                adjustMenu.call(this);
              }
            };
          }
          const distanceToMove = numUncheckedBelow * tabRowHeight;
          let filterOffset = 0;
          if (this.filterState.tabs[id]) {
            filterOffset = this.filterState.tabs[id].filterOffset;
            this.filterState.tabs[id].filterOffset = movedTabFilterOffset;
          }
          const newOffset = distanceToMove + filterOffset;

          window.requestAnimationFrame(() => {
            tab.style.setProperty("--moved-offset", distanceToMove + "px");
            tab.classList.add("tab--banana");
          });

          this.tabIndices[id] = [
            lastTabIndex - numCheckedBelow,
            this.tabIndices[id][1] + numUncheckedBelow
          ];

          numCheckedAbove += 1;
          // lastVisibleIsChecked = true;
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        this.tabIndices[id][0] -= numCheckedAbove;
      }
    } else {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        this.moveState[id] = {};
        // if tab is NOT checked
        if (obj.isChecked === false) {
          const numCheckedBelow = this.menuData.numChecked - numCheckedAbove;
          this.tabIndices[id] = [
            this.tabIndices[id][0] + numCheckedBelow,
            this.tabIndices[id][1] + numCheckedBelow
          ];
          this.moveState[id].distance = numCheckedBelow * tabRowHeight;
          numUncheckedAbove += 1;
        } else {
          // if tab IS checked
          this.tabIndices[id] = [numCheckedAbove, numCheckedAbove];

          if (this.filterState.tabs[id]) {
            this.filterState.tabs[id].filterOffset = 0;
          }
          this.moveState[id].distance = numUncheckedAbove * tabRowHeight * -1;
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

  // move browser tabs
  const movedTabsBrowserIds = this.moveState.checkedVisibleTabs.map(
    tab => +tab.id.split("-")[1]
  );

  const moveBrowserTabsToIndex = async function (tabsToMove, index) {
    try {
      await chrome.tabs.move(movedTabsBrowserIds, {
        index: lastTabIndex
      });
    } catch (error) {
      if (
        error ==
        "Error: Tabs cannot be edited right now (user may be dragging a tab)."
      ) {
        setTimeout(() => moveBrowserTabsToIndex(index), 50);
      } else {
        console.error(error);
      }
    }
  };

  moveBrowserTabsToIndex(movedTabsBrowserIds, this.moveState.lastTabIndex);
  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = reorderedVisibleTabIds;
  // adjustMenu.call(this);
}

module.exports = moveTabs;
