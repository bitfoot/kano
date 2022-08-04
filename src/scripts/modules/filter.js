"use strict";

const util = require("./util");
const adjustMenu = require("./adjustMenu");

function filter() {
  const state = this;
  const filterState = state.filterState;
  const filterString = filterState.input.value.toLowerCase();
  state.visibleTabIds = [];
  this.numOfVisibleTabs = 0;
  const TAB_HEIGHT = 46;

  const matchesFilter = (title, filterString) => {
    return title.toLowerCase().includes(filterString);
  };

  const prepareFilteredTabObjects = tabObjects => {
    filterState.numOfFilteredTabs = 0;
    filterState.firstMovedTabIndex = null;
    filterState.lastMovedTabIndex = null;
    filterState.firstHiddenTabIndex = null;
    filterState.lastHiddenTabIndex = null;
    filterState.firstVisibleTabIndex = null;
    filterState.lastVisibleTabIndex = null;
    filterState.firstNewlyFilteredOutTabIndex = null;
    filterState.lastNewlyFilteredOutTabIndex = null;
    filterState.firstNewlyFilteredInTabIndex = null;
    filterState.lastNewlyFilteredInTabIndex = null;
    filterState.lastMatchedTabIndex = null;
    filterState.newlyFilteredOut = 0;
    let filteredOutAbove = 0;
    // let newlyFilteredOutAbove = 0;
    let newlyFilteredInAbove = 0;
    let filteredIndex = 0;

    tabObjects.forEach((obj, index) => {
      const newFilterOffset = filteredOutAbove * TAB_HEIGHT * -1;
      const newFilteredTabObj = {
        index,
        filteredIndex: null,
        isNewlyFilteredIn: false,
        isNewlyFilteredOut: false,
        isFilteredOut: false,
        filterOffset: newFilterOffset,
        isMovedUp: false,
        isMovedDown: false,
        newlyFilteredOutAbove: filterState.newlyFilteredOut,
        newlyFilteredInAbove
      };

      const matches = matchesFilter(obj.title, filterString);

      // if tab was filtered previously, see if it was previously filtered out (hidden)
      // and whether it has to be moved
      let wasFilteredOut = false;
      let previousFilterOffset = 0;
      if (filterState.tabs[obj.id] !== undefined) {
        wasFilteredOut = filterState.tabs[obj.id].isFilteredOut;
        previousFilterOffset = filterState.tabs[obj.id].filterOffset;
      }

      if (matches) {
        state.visibleTabIds.push(obj.id);
        state.tabIndices[obj.id][1] = filteredIndex;
        obj.isVisible = true;
        newFilteredTabObj.filteredIndex = filteredIndex;
        filteredIndex += 1;
        filterState.lastMatchedTabIndex = index;
        filterState.numOfFilteredTabs += 1;
        // this.numOfVisibleTabs = filterState.numOfFilteredTabs;
        // determine if tab moved up or down
        // newFilteredTabObj.movedBy = newFilterOffset - previousFilterOffset;
        newFilteredTabObj.isMovedUp = previousFilterOffset > newFilterOffset;
        newFilteredTabObj.isMovedDown = previousFilterOffset < newFilterOffset;
        if (newFilteredTabObj.movedBy != 0) {
          if (filterState.firstMovedTabIndex == null) {
            filterState.firstMovedTabIndex = newFilteredTabObj.index;
          }
          filterState.lastMovedTabIndex = newFilteredTabObj.index;
        }

        // filterState.firstMovedTabIndex
        // if tab was previously filtered out (hidden from view)
        if (wasFilteredOut) {
          newFilteredTabObj.isNewlyFilteredIn = true;
          newlyFilteredInAbove += 1;
          filterState.lastNewlyFilteredInTabIndex = index;
          if (filterState.firstNewlyFilteredInTabIndex === null) {
            filterState.firstNewlyFilteredInTabIndex = index;
          }
        } else {
          filterState.lastVisibleTabIndex = index;
          // if (filterState.firstVisibleTabIndex === null) {
          //   filterState.firstVisibleTabIndex = index;
          // }
        }
      } else {
        obj.isVisible = false;
        // state.hiddenTabIds.push(obj.id);
        newFilteredTabObj.isFilteredOut = true;
        filteredOutAbove += 1;
        filterState.lastHiddenTabIndex = index;
        if (filterState.firstHiddenTabIndex === null) {
          filterState.firstHiddenTabIndex = index;
        }
        if (!wasFilteredOut) {
          newFilteredTabObj.isNewlyFilteredOut = true;
          filterState.newlyFilteredOut += 1;
          filterState.lastNewlyFilteredOutTabIndex = index;
          if (filterState.firstNewlyFilteredOutTabIndex === null) {
            filterState.firstNewlyFilteredOutTabIndex = index;
          }
        }
      }

      filterState.tabs[obj.id] = newFilteredTabObj;
    });
  };

  prepareFilteredTabObjects(state.orderedTabObjects);

  const hideTab = tab => {
    tab.ariaHidden = "true";
    if (!tab.classList.contains("tab--filtered-out")) {
      tab.classList.add("tab--filtered-out");
    }
    if (tab.classList.contains("tab--filtered")) {
      tab.classList.remove("tab--filtered");
    }
    tab.setAttribute("disabled", true);
  };

  const unhideTab = tab => {
    tab.ariaHidden = "false";
    if (!tab.classList.contains("tab--filtered")) {
      tab.classList.add("tab--filtered");
    }
    if (tab.classList.contains("tab--filtered-out")) {
      tab.classList.remove("tab--filtered-out");
    }
    tab.setAttribute("disabled", false);
  };

  // 120ms
  const styleTabs = tabs => {
    const getTransformDelay = tabObj => {
      let transformDelay = 0;
      const alreadyVisible = !tabObj.isFilteredOut && !tabObj.isNewlyFilteredIn;

      if (tabObj.isFilteredOut) {
        transformDelay = 200;
      } else if (alreadyVisible) {
        if (filterState.newlyFilteredOut) {
          transformDelay = 200;
        }
      } else if (tabObj.isNewlyFilteredIn) {
        transformDelay = 0;
      }

      return transformDelay;
    };

    const getTransformDuration = tabObj => {
      let transformDuration = 0;
      if (!tabObj.isFilteredOut && !tabObj.isNewlyFilteredIn) {
        transformDuration = 200;
      }
      return transformDuration;
    };

    const getOpacityDuration = tabObj => {
      let opacityDuration = 200;
      if (tabObj.isFilteredOut && !tabObj.isNewlyFilteredOut) {
        opacityDuration = 0;
      }
      return opacityDuration;
    };

    const getOpacityDelay = tabObj => {
      let opacityDelay = 0;

      if (tabObj.isNewlyFilteredOut) {
        // if current tab is newly filtered out (getting hidden)
        opacityDelay = 0;
      } else if (!tabObj.isFilteredOut && !tabObj.isNewlyFilteredIn) {
        // if current tab is already visible and not filtered out
        opacityDelay = 0;
      } else if (tabObj.isNewlyFilteredIn) {
        // if current tab is newly filtered in (getting unhidden)
        if (filterState.lastVisibleTabIndex !== null) {
          // if some tabs are filtered out between it and the next visible tab, it needs 400 delay
          if (
            tabObj.newlyFilteredOutAbove ||
            filterState.newlyFilteredOut > tabObj.newlyFilteredOutAbove
          ) {
            opacityDelay = 400;
          } else if (
            filterState.lastVisibleTabIndex >
            filterState.firstNewlyFilteredInTabIndex
          ) {
            opacityDelay = 200;
          }
        } else if (filterState.lastNewlyFilteredOutTabIndex !== null) {
          opacityDelay = 200;
        }
      }

      return opacityDelay;
    };

    state.tabs.forEach(tab => {
      const filteredTabObject = filterState.tabs[tab.id];
      const transformDelay = getTransformDelay(filteredTabObject);
      const opacityDelay = getOpacityDelay(filteredTabObject);
      const transformDuration = getTransformDuration(filteredTabObject);
      const opacityDuration = getOpacityDuration(filteredTabObject);

      requestAnimationFrame(() => {
        tab.style.setProperty("--trans-delay", transformDelay + "ms");
        tab.style.setProperty("--opacity-delay", opacityDelay + "ms");
        tab.style.setProperty("--trans-duration", transformDuration + "ms");
        tab.style.setProperty("--opacity-duration", opacityDuration + "ms");
        tab.style.setProperty(
          "--y-offset",
          filteredTabObject.filterOffset + "px"
        );
        if (filteredTabObject.isFilteredOut == true) {
          hideTab(tab);
        } else {
          unhideTab(tab);
        }
      });
    });
  };

  adjustMenu.call(state);
  util.adjustScrollbar.call(state);
  styleTabs(state.tabs);
}

module.exports = filter;
