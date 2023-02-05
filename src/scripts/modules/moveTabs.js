"use strict";

import { disableHeaderControls } from "./util";
import { resetTabCSSVariables } from "./util";

function moveTabs(destinaton) {
  const tabHeight = 40;
  const margin = 6;
  const tabRowHeight = tabHeight + margin;
  // const checkedVisibleTabs = this.menu.checkedVisibleTabs;
  const lastTabIndex = this.orderedTabObjects.length - 1;
  let lastPinnedTabIndex = this.menu.lastPinnedTabIndex;
  let firstUnpinnedTabIndex = null;
  let lastUnpinnedTabIndex = null;
  if (lastPinnedTabIndex !== lastTabIndex) {
    lastUnpinnedTabIndex = lastTabIndex;
    if (lastPinnedTabIndex === null) {
      firstUnpinnedTabIndex = 0;
    } else {
      firstUnpinnedTabIndex = lastPinnedTabIndex + 1;
    }
  }

  const checkedVisiblePinnedTabs = [];
  const checkedVisibleUnpinnedTabs = [];
  const visibleTabs = [];
  let numPinned = 0;
  let numUnpinned = 0;
  let numCheckedPinned = 0;
  let numCheckedUnpinned = 0;
  let lastVisiblePinnedTabId = null;
  let lastVisibleUnpinnedTabId = null;
  let tabIndexToInsertPinnedBefore = null;
  let tabIndexToInsertUnpinnedBefore = null;

  // console.log(this.visibleTabIds);

  for (let index = 0; index < this.visibleTabIds.length; index++) {
    const id = this.visibleTabIds[index];
    const browserIndex = this.tabIndices[id][0];
    const isPinned = this.orderedTabObjects[browserIndex].isPinned === true;
    const isChecked = this.orderedTabObjects[browserIndex].isChecked === true;
    const tab = this.tabs[browserIndex];
    visibleTabs[index] = tab;

    if (isPinned === true) {
      numPinned += 1;
      // lastVisiblePinnedTabId = id;
      if (isChecked === true) {
        checkedVisiblePinnedTabs[numCheckedPinned] = tab;
        numCheckedPinned += 1;
      }
    } else {
      numUnpinned += 1;
      // lastVisibleUnpinnedTabId = id;
      if (isChecked === true) {
        checkedVisibleUnpinnedTabs[numCheckedUnpinned] = tab;
        numCheckedUnpinned += 1;
      }
    }
  }

  const heightOfPinnedTabs = numPinned * tabRowHeight;

  if (numPinned && numUnpinned) {
    window.requestAnimationFrame(() => {
      this.tabList.style.setProperty(
        "--pinned-tabs-height",
        heightOfPinnedTabs - margin + "px"
      );
      this.tabList.classList.add("tab-list--moving");
    });
  }

  const numUncheckedPinned = numPinned - numCheckedPinned;
  const numUncheckedUnpinned = numUnpinned - numCheckedUnpinned;
  let numCheckedPinnedAbove = 0;
  let numUncheckedPinnedAbove = 0;
  let numCheckedUnpinnedAbove = 0;
  let numUncheckedUnpinnedAbove = 0;

  disableHeaderControls.call(this);

  // reset variables
  resetTabCSSVariables(visibleTabs);

  // get info about tabs
  this.moveState = {
    firstHiddenTabIndex: null,
    lastTabIndex,
    tabRowHeight,
    destinaton,
    onMoveEnd: function () {
      // reset style variables and move tabs in the DOM
      visibleTabs.forEach(tab => {
        // const tab = visibleTabs[index];
        const id = tab.id;
        let newOffset = 0;
        if (this.filterState.tabs[id]) {
          newOffset = this.filterState.tabs[id].filterOffset;
        }

        window.requestAnimationFrame(() => {
          tab.classList.remove(
            "tab--moving",
            "tab--moving-above",
            "tab--tethered"
          );
          tab.style.setProperty("--filter-offset", newOffset + "px");
          tab.style.setProperty("--moved-offset", 0 + "px");
        });
      });

      this.filterState.firstHiddenTabIndex = this.moveState.firstHiddenTabIndex;
      const options = {
        pinnedTabsToMove: checkedVisiblePinnedTabs,
        unpinnedTabsToMove: checkedVisibleUnpinnedTabs
      };
      this.moveState.moveTabsInTheDOM(options);

      // enable menu buttons and filter
      window.requestAnimationFrame(() => {
        this.tabList.classList.remove("tab-list--moving");
        const event = new Event("orderoftabschange", { bubbles: true });
        this.tabList.dispatchEvent(event);
      });
    }.bind(this),
    moveTabsInTheDOM: function (options) {
      const { pinnedTabsToMove, unpinnedTabsToMove } = options;
      const fragmentOfPinned = document.createDocumentFragment();
      const fragmentOfUnpinned = document.createDocumentFragment();

      let tabToInsertPinnedBefore = null;
      let tabToInsertUnpinnedBefore = null;

      if (pinnedTabsToMove.length > 0) {
        tabToInsertPinnedBefore = this.tabs[tabIndexToInsertPinnedBefore];
        console.log(tabToInsertPinnedBefore);
      }
      if (unpinnedTabsToMove.length > 0) {
        tabToInsertUnpinnedBefore = this.tabs[tabIndexToInsertUnpinnedBefore];
      }

      pinnedTabsToMove.forEach(tab => {
        fragmentOfPinned.appendChild(tab);
      });
      unpinnedTabsToMove.forEach(tab => {
        fragmentOfUnpinned.appendChild(tab);
      });

      window.requestAnimationFrame(() => {
        if (lastPinnedTabIndex !== null) {
          this.tabList.insertBefore(fragmentOfPinned, tabToInsertPinnedBefore);
        }
        if (lastUnpinnedTabIndex !== null) {
          this.tabList.insertBefore(
            fragmentOfUnpinned,
            tabToInsertUnpinnedBefore
          );
        }
        this.tabs = [...this.tabList.children];
      });
    }.bind(this)
  };

  const reorderedVisibleTabIds = [];
  const reorderedTabObjects = [];
  let animation = false;
  let maxDistanceToMove = 0;

  this.orderedTabObjects.forEach((obj, index) => {
    const id = obj.id;

    if (destinaton === "bottom") {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        const tab = this.tabs[index];
        window.requestAnimationFrame(() => {
          tab.classList.add("tab--tethered");
        });
        // if tab is NOT checked
        if (obj.isChecked === false) {
          let numCheckedAbove;
          let numUncheckedAbove;
          let numUnchecked;
          if (obj.isPinned) {
            numUnchecked = numUncheckedPinned;
            numCheckedAbove = numCheckedPinnedAbove;
            numUncheckedAbove = numUncheckedPinnedAbove;
            numUncheckedPinnedAbove += 1;
            // window.requestAnimationFrame(() => {
            //   tab.classList.add("tab--tethered");
            // });
          } else {
            numUnchecked = numUncheckedUnpinned;
            numCheckedAbove = numCheckedUnpinnedAbove;
            numUncheckedAbove = numUncheckedUnpinnedAbove;
            numUncheckedUnpinnedAbove += 1;
            if (tabIndexToInsertPinnedBefore === null) {
              tabIndexToInsertPinnedBefore = index;
            }
          }

          if (numCheckedAbove > 0) {
            this.tabIndices[id] = [
              this.tabIndices[id][0] - numCheckedAbove,
              this.tabIndices[id][1] - numCheckedAbove
            ];
            const distanceToMove = numCheckedAbove * tabRowHeight * -1;
            window.requestAnimationFrame(() => {
              tab.style.setProperty("--moved-offset", distanceToMove + "px");
              tab.classList.add("tab--moving-above");
            });

            const numUncheckedBelow = numUnchecked - numUncheckedAbove - 1;
            if (numUncheckedBelow === 0) {
              if (Math.abs(distanceToMove) > maxDistanceToMove) {
                maxDistanceToMove = Math.abs(distanceToMove);
              }
            }
          }
        } else {
          // if tab IS checked
          let numCheckedAbove;
          let numUncheckedAbove;
          let numChecked;
          let numUnchecked;
          // let movedTabFilterOffset = 0;
          let lastTabIndex;
          if (obj.isPinned) {
            numChecked = numCheckedPinned;
            numUnchecked = numUncheckedPinned;
            numCheckedAbove = numCheckedPinnedAbove;
            numUncheckedAbove = numUncheckedPinnedAbove;
            // movedTabFilterOffset = movedPinnedTabsFilterOffset;
            numCheckedPinnedAbove += 1;
            lastTabIndex = lastPinnedTabIndex;
            // window.requestAnimationFrame(() => {
            //   tab.classList.add("tab--tethered");
            // });
          } else {
            numChecked = numCheckedUnpinned;
            numUnchecked = numUncheckedUnpinned;
            numCheckedAbove = numCheckedUnpinnedAbove;
            numUncheckedAbove = numUncheckedUnpinnedAbove;
            // movedTabFilterOffset = movedUnpinnedTabFilterOffset;
            numCheckedUnpinnedAbove += 1;
            lastTabIndex = lastUnpinnedTabIndex;
          }

          const numCheckedBelow = numChecked - numCheckedAbove - 1;
          const numUncheckedBelow = numUnchecked - numUncheckedAbove;
          const distanceToMove = numUncheckedBelow * tabRowHeight;

          // if (numCheckedAbove === 0) {
          // console.log(tabIndexToInsertPinnedBefore);

          if (numUncheckedBelow > 0) {
            if (distanceToMove > maxDistanceToMove) {
              maxDistanceToMove = distanceToMove;
            }

            if (animation === false) {
              animation = true;
              tab.onanimationend = e => {
                if (e.animationName === "moving") {
                  tab.onanimationend = null;
                  this.moveState.onMoveEnd.call(this);
                }
              };
            }
          }

          this.tabIndices[id] = [
            lastTabIndex - numCheckedBelow,
            this.tabIndices[id][1] + numUncheckedBelow
          ];

          const hiddenAbove = this.tabIndices[id][0] - this.tabIndices[id][1];
          const movedTabFilterOffset = hiddenAbove * tabRowHeight * -1;

          if (this.filterState.tabs[id]) {
            this.filterState.tabs[id].filterOffset = movedTabFilterOffset;
          }
          if (numUncheckedBelow > 0) {
            window.requestAnimationFrame(() => {
              tab.style.setProperty("--moved-offset", distanceToMove + "px");
              tab.style.setProperty("--scale", 0.96);
              tab.style.setProperty("--opacity", 0.4);
              tab.classList.add("tab--moving");
            });
          }

          // numCheckedAbove += 1;
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
        // reorderedVisibleTabIds[reorderedVisibleTabIds.length] = id;
      } else {
        // if tab is hidden
        let numCheckedAbove;
        if (obj.isPinned) {
          numCheckedAbove = numCheckedPinnedAbove;
        } else {
          if (tabIndexToInsertPinnedBefore === null) {
            tabIndexToInsertPinnedBefore = index;
          }
          numCheckedAbove = numCheckedUnpinnedAbove;
        }
        this.tabIndices[id][0] -= numCheckedAbove;
        this.filterState.lastHiddenTabIndex = this.tabIndices[id][0];
        if (this.moveState.firstHiddenTabIndex === null) {
          this.moveState.firstHiddenTabIndex = this.tabIndices[id][0];
        }
      }
    } else {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        const tab = this.tabs[index];
        window.requestAnimationFrame(() => {
          tab.classList.add("tab--tethered");
        });
        // if tab is NOT checked
        if (obj.isChecked === false) {
          let numCheckedAbove;
          let numChecked;
          if (obj.isPinned) {
            numChecked = numCheckedPinned;
            numCheckedAbove = numCheckedPinnedAbove;
            numUncheckedPinnedAbove += 1;
          } else {
            numChecked = numCheckedUnpinned;
            numCheckedAbove = numCheckedUnpinnedAbove;
            numUncheckedUnpinnedAbove += 1;
            if (tabIndexToInsertUnpinnedBefore === null) {
              tabIndexToInsertUnpinnedBefore = index;
            }
          }

          if (tabIndexToInsertPinnedBefore === null) {
            tabIndexToInsertPinnedBefore = index;
          }

          const numCheckedBelow = numChecked - numCheckedAbove;

          if (numCheckedBelow > 0) {
            this.tabIndices[id] = [
              this.tabIndices[id][0] + numCheckedBelow,
              this.tabIndices[id][1] + numCheckedBelow
            ];
            const distanceToMove = numCheckedBelow * tabRowHeight;
            window.requestAnimationFrame(() => {
              tab.style.setProperty("--moved-offset", distanceToMove + "px");
              tab.classList.add("tab--moving-above");
            });

            if (distanceToMove > maxDistanceToMove) {
              maxDistanceToMove = distanceToMove;
            }
          }

          // numUncheckedAbove += 1;
        } else {
          // if tab IS checked
          let numCheckedAbove;
          let numUncheckedAbove;
          let numChecked;
          let firstTabIndex;
          if (obj.isPinned) {
            numChecked = numCheckedPinned;
            numCheckedAbove = numCheckedPinnedAbove;
            numUncheckedAbove = numUncheckedPinnedAbove;
            numCheckedPinnedAbove += 1;
            firstTabIndex = 0;
          } else {
            numChecked = numCheckedUnpinned;
            numCheckedAbove = numCheckedUnpinnedAbove;
            numUncheckedAbove = numUncheckedUnpinnedAbove;
            numCheckedUnpinnedAbove += 1;
            firstTabIndex = firstUnpinnedTabIndex;
          }

          const numCheckedBelow = numChecked - numCheckedAbove - 1;
          const distanceToMove = numUncheckedAbove * tabRowHeight * -1;
          // const tab = this.tabs[index];

          if (numUncheckedAbove > 0) {
            if (Math.abs(distanceToMove) > maxDistanceToMove) {
              maxDistanceToMove = Math.abs(distanceToMove);
            }

            if (animation === false) {
              animation = true;
              tab.onanimationend = e => {
                if (e.animationName === "moving") {
                  tab.onanimationend = null;
                  this.moveState.onMoveEnd.call(this);
                }
              };
            }
          }

          this.tabIndices[id][0] = firstTabIndex + numCheckedAbove;
          this.tabIndices[id][1] -= numUncheckedAbove;

          const hiddenAbove = this.tabIndices[id][0] - this.tabIndices[id][1];
          const movedTabFilterOffset = hiddenAbove * tabRowHeight * -1;

          if (this.filterState.tabs[id]) {
            this.filterState.tabs[id].filterOffset = movedTabFilterOffset;
          }

          if (numUncheckedAbove > 0) {
            window.requestAnimationFrame(() => {
              tab.style.setProperty("--moved-offset", distanceToMove + "px");
              tab.style.setProperty("--scale", 0.96);
              tab.style.setProperty("--opacity", 0.4);
              tab.classList.add("tab--moving");
            });
          }
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        let numChecked;
        let numCheckedAbove;
        if (obj.isPinned) {
          numChecked = numCheckedPinned;
          numCheckedAbove = numCheckedPinnedAbove;
        } else {
          numChecked = numCheckedUnpinned;
          numCheckedAbove = numCheckedUnpinnedAbove;
          if (tabIndexToInsertUnpinnedBefore === null) {
            tabIndexToInsertUnpinnedBefore = index;
          }
        }

        if (tabIndexToInsertPinnedBefore === null) {
          tabIndexToInsertPinnedBefore = index;
        }

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

  const animationDuration = Math.min(maxDistanceToMove * 2.174, 220);
  document.documentElement.style.setProperty(
    "--animation-duration",
    animationDuration + "ms"
  );

  // move browser tabs
  const movedPinnedTabsBrowserIds = checkedVisiblePinnedTabs.map(
    tab => +tab.id.split("-")[1]
  );
  const movedUnpinnedTabsBrowserIds = checkedVisibleUnpinnedTabs.map(
    tab => +tab.id.split("-")[1]
  );

  const moveBrowserTabsToIndex = async function (tabIds, index) {
    try {
      await chrome.tabs.move(tabIds, {
        index
      });
    } catch (error) {
      if (
        error ==
        "Error: Tabs cannot be edited right now (user may be dragging a tab)."
      ) {
        setTimeout(() => moveBrowserTabsToIndex(tabIds, index), 50);
      } else {
        console.error(error);
      }
    }
  };

  if (movedPinnedTabsBrowserIds.length > 0) {
    const indexToMovePinnedTo =
      destinaton === "bottom" ? lastPinnedTabIndex : 0;
    moveBrowserTabsToIndex(movedPinnedTabsBrowserIds, indexToMovePinnedTo);
  }
  if (movedUnpinnedTabsBrowserIds.length > 0) {
    const indexToMoveUnpinnedTo =
      destinaton === "bottom" ? lastTabIndex : firstUnpinnedTabIndex;
    moveBrowserTabsToIndex(movedUnpinnedTabsBrowserIds, indexToMoveUnpinnedTo);
  }

  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = reorderedVisibleTabIds;
  if (animation === false) {
    this.moveState.onMoveEnd.call(this);
  }
}

export { moveTabs };
