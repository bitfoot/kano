"use strict";

const easeInOutQuad = require("./util").easeInOutQuad;
const easeInQuad = require("./util").easeInQuad;
const disableHeaderControls = require("./util").disableHeaderControls;
const enableHeaderControls = require("./util").enableHeaderControls;
const resetTabCSSVariables = require("./util").resetTabCSSVariables;
const adjustMenu = require("./adjustMenu");

function moveTabs(destinaton) {
  const tabHeight = 40;
  const margin = 6;
  const tabRowHeight = tabHeight + margin;
  const checkedVisibleTabs = this.menu.checkedVisibleTabs;
  const lastTabIndex = this.orderedTabObjects.length - 1;
  const numHiddenTabs =
    this.orderedTabObjects.length - this.visibleTabIds.length;
  const movedTabFilterOffset =
    destinaton === "bottom" ? numHiddenTabs * tabRowHeight * -1 : 0;

  const numChecked = this.menu.checkedVisibleTabs.length;
  const numUnchecked = this.visibleTabIds.length - numChecked;
  let numCheckedAbove = 0;
  let numUncheckedAbove = 0;
  // let animationDuration;
  // let firstHiddenTabIndex = null;

  disableHeaderControls.call(this);

  // reset variables
  const visibleTabs = this.visibleTabIds.map(id => {
    const index = this.tabIndices[id][0];
    return this.tabs[index];
  });

  resetTabCSSVariables(visibleTabs);

  // get info about tabs
  this.moveState = {
    firstHiddenTabIndex: null,
    lastTabIndex,
    tabRowHeight,
    checkedVisibleTabs,
    destinaton,
    onMoveEnd: function () {
      // reset style variables and move tabs in the DOM
      this.visibleTabIds.forEach(id => {
        const tab = document.getElementById(id);
        let newOffset = 0;
        if (this.filterState.tabs[id]) {
          newOffset = this.filterState.tabs[id].filterOffset;
        }

        window.requestAnimationFrame(() => {
          tab.classList.remove("tab--moving");
          tab.classList.remove("tab--peach");
          tab.style.setProperty("--filter-offset", newOffset + "px");
          tab.style.setProperty("--moved-offset", 0 + "px");
          // tab.style.setProperty("--scale", 1);
        });
      });

      this.filterState.firstHiddenTabIndex = this.moveState.firstHiddenTabIndex;
      this.moveState.moveTabsInTheDOM(this.moveState.checkedVisibleTabs);

      // enable menu buttons and filter
      window.requestAnimationFrame(() => {
        adjustMenu.call(this);
        enableHeaderControls.call(this);
      });
    }.bind(this),
    moveTabsInTheDOM: function (tabsToMove) {
      const fragmentOfChecked = document.createDocumentFragment();
      tabsToMove.forEach(tab => {
        fragmentOfChecked.appendChild(tab);
      });

      let tabToInsertBefore;
      if (this.moveState.destinaton === "bottom") {
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
  let animateMovement = true;
  let maxDistanceToMove = 0;

  this.orderedTabObjects.forEach((obj, index) => {
    const id = obj.id;

    if (destinaton === "bottom") {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        // if tab is NOT checked
        if (obj.isChecked === false) {
          if (numCheckedAbove > 0) {
            this.tabIndices[id] = [
              this.tabIndices[id][0] - numCheckedAbove,
              this.tabIndices[id][1] - numCheckedAbove
            ];
            const distanceToMove = numCheckedAbove * tabRowHeight * -1;
            const tab = this.tabs[index];
            window.requestAnimationFrame(() => {
              tab.style.setProperty("--moved-offset", distanceToMove + "px");
              // tab.style.setProperty(
              //   "--animation-duration",
              //   animationDuration + 100 + "ms"
              // );
              tab.classList.add("tab--peach");
            });

            const numUncheckedBelow = numUnchecked - numUncheckedAbove - 1;
            if (numUncheckedBelow === 0) {
              maxDistanceToMove =
                Math.abs(distanceToMove) > maxDistanceToMove
                  ? Math.abs(distanceToMove)
                  : maxDistanceToMove;
            }
          }

          numUncheckedAbove += 1;
        } else {
          // if tab IS checked
          const numCheckedBelow = numChecked - numCheckedAbove - 1;
          const numUncheckedBelow = numUnchecked - numUncheckedAbove;

          const distanceToMove = numUncheckedBelow * tabRowHeight;

          const tab = this.tabs[index];
          if (numCheckedAbove === 0) {
            if (numUncheckedBelow > 0) {
              maxDistanceToMove =
                distanceToMove > maxDistanceToMove
                  ? distanceToMove
                  : maxDistanceToMove;
              // animationDuration = Math.min(distanceToMove * 2.174, 400);
              tab.onanimationend = e => {
                if (e.animationName === "moving") {
                  tab.onanimationend = null;
                  this.moveState.onMoveEnd.call(this);
                }
              };
            } else animateMovement = false;
          }

          this.tabIndices[id] = [
            lastTabIndex - numCheckedBelow,
            this.tabIndices[id][1] + numUncheckedBelow
          ];
          if (this.filterState.tabs[id]) {
            this.filterState.tabs[id].filterOffset = movedTabFilterOffset;
          }
          if (numUncheckedBelow > 0) {
            window.requestAnimationFrame(() => {
              tab.style.setProperty("--moved-offset", distanceToMove + "px");
              tab.style.setProperty("--scale", 0.96);
              tab.style.setProperty("--opacity", 0.4);
              // tab.style.setProperty(
              //   "--animation-duration",
              //   animationDuration + "ms"
              // );
              tab.classList.add("tab--moving");
            });
          }

          numCheckedAbove += 1;
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        this.tabIndices[id][0] -= numCheckedAbove;
        this.filterState.lastHiddenTabIndex = this.tabIndices[id][0];
        if (this.moveState.firstHiddenTabIndex === null) {
          this.moveState.firstHiddenTabIndex = this.tabIndices[id][0];
        }
      }
    } else {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        // this.moveState[id] = {};
        // if tab is NOT checked
        if (obj.isChecked === false) {
          const numCheckedBelow = numChecked - numCheckedAbove;
          if (numCheckedBelow > 0) {
            this.tabIndices[id] = [
              this.tabIndices[id][0] + numCheckedBelow,
              this.tabIndices[id][1] + numCheckedBelow
            ];
            const distanceToMove = numCheckedBelow * tabRowHeight;

            const tab = this.tabs[index];
            window.requestAnimationFrame(() => {
              tab.style.setProperty("--moved-offset", distanceToMove + "px");
              // tab.style.setProperty(
              //   "--animation-duration",
              //   animationDuration + 100 + "ms"
              // );
              tab.classList.add("tab--peach");
            });

            maxDistanceToMove =
              distanceToMove > maxDistanceToMove
                ? distanceToMove
                : maxDistanceToMove;
          }

          numUncheckedAbove += 1;
        } else {
          // if tab IS checked

          const numCheckedBelow = numChecked - numCheckedAbove - 1;

          const distanceToMove = numUncheckedAbove * tabRowHeight * -1;
          const tab = this.tabs[index];

          if (numCheckedBelow === 0) {
            if (numUncheckedAbove > 0) {
              // animationDuration = Math.min(
              //   Math.abs(distanceToMove) * 2.174,
              //   400
              // );

              maxDistanceToMove =
                Math.abs(distanceToMove) > maxDistanceToMove
                  ? Math.abs(distanceToMove)
                  : maxDistanceToMove;
              tab.onanimationend = e => {
                if (e.animationName === "moving") {
                  tab.onanimationend = null;
                  this.moveState.onMoveEnd.call(this);
                }
              };
            } else animateMovement = false;
          }

          this.tabIndices[id] = [numCheckedAbove, numCheckedAbove];
          if (this.filterState.tabs[id]) {
            this.filterState.tabs[id].filterOffset = 0;
          }

          if (numUncheckedAbove > 0) {
            // const distanceToMove = numUncheckedAbove * tabRowHeight * -1;
            window.requestAnimationFrame(() => {
              tab.style.setProperty("--moved-offset", distanceToMove + "px");
              tab.style.setProperty("--scale", 0.96);
              tab.style.setProperty("--opacity", 0.4);
              // tab.style.setProperty(
              //   "--animation-duration",
              //   animationDuration + "ms"
              // );
              tab.classList.add("tab--moving");
            });
          }

          numCheckedAbove += 1;
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        const numCheckedBelow = numChecked - numCheckedAbove;
        this.tabIndices[id][0] += numCheckedBelow;

        this.filterState.lastHiddenTabIndex = this.tabIndices[id][0];
        if (this.moveState.firstHiddenTabIndex === null) {
          this.moveState.firstHiddenTabIndex = this.tabIndices[id][0];
        }
      }
    }
    reorderedTabObjects[this.tabIndices[id][0]] = obj;
  });

  const animationDuration = Math.min(maxDistanceToMove * 2.174, 200);
  document.documentElement.style.setProperty(
    "--animation-duration",
    animationDuration + "ms"
  );
  // move browser tabs
  const movedTabsBrowserIds = this.moveState.checkedVisibleTabs.map(
    tab => +tab.id.split("-")[1]
  );

  const moveBrowserTabsToIndex = async function (tabsToMove, index) {
    try {
      await chrome.tabs.move(movedTabsBrowserIds, {
        index
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

  const indexToMoveTo = destinaton === "bottom" ? lastTabIndex : 0;
  moveBrowserTabsToIndex(movedTabsBrowserIds, indexToMoveTo);
  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = reorderedVisibleTabIds;
  if (!animateMovement) {
    this.moveState.onMoveEnd.call(this);
  }
  // adjustMenu.call(this);
}

module.exports = moveTabs;
