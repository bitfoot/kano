"use strict";

const util = require("./util");
const adjustMenu = require("./adjustMenu");

function filter() {
  const state = this;
  const filterState = state.filterState;
  const filterString = filterState.input.value.toLowerCase();
  state.visibleTabs = [];
  this.numOfVisibleTabs = 0;
  const TAB_HEIGHT = 46;

  const matchesFilter = (title, filterString) => {
    return title.toLowerCase().includes(filterString);
  };

  const prepareFilteredTabObjects = tabObjects => {
    filterState.numOfFilteredTabs = 0;
    filterState.firstHiddenTabIndex = null;
    filterState.firstVisibleTabIndex = null;
    filterState.lastVisibleTabIndex = null;
    filterState.firstNewlyFilteredOutTabIndex = null;
    filterState.lastNewlyFilteredOutTabIndex = null;
    filterState.firstNewlyFilteredInTabIndex = null;
    filterState.lastNewlyFilteredInTabIndex = null;
    filterState.lastMatchedTabIndex = null;
    let filteredOutAbove = 0;
    let filteredIndex = 0;

    tabObjects.forEach((obj, index) => {
      const filterOffset = filteredOutAbove * TAB_HEIGHT * -1;
      const newObj = {
        index,
        filteredIndex: null,
        isNewlyFilteredIn: false,
        isNewlyFilteredOut: false,
        isFilteredOut: false,
        filterOffset
      };

      // if tab was filtered previously, see if it's already filtered out (hidden)
      let wasFilteredOut = false;
      if (filterState.tabs[obj.id] !== undefined) {
        wasFilteredOut = filterState.tabs[obj.id].isFilteredOut;
      }

      const matches = matchesFilter(obj.title, filterString);

      if (matches) {
        obj.isVisible = true;
        newObj.filteredIndex = filteredIndex;
        filteredIndex += 1;
        filterState.lastMatchedTabIndex = index;
        filterState.numOfFilteredTabs += 1;
        this.numOfVisibleTabs = filterState.numOfFilteredTabs;
        // if tab was previously filtered out (hidden from view)
        if (wasFilteredOut) {
          newObj.isNewlyFilteredIn = true;
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
        newObj.isFilteredOut = true;
        filteredOutAbove += 1;
        filterState.lastHiddenTabIndex = index;
        if (filterState.firstHiddenTabIndex === null) {
          filterState.firstHiddenTabIndex = index;
        }
        if (!wasFilteredOut) {
          newObj.isNewlyFilteredOut = true;
          filterState.lastNewlyFilteredOutTabIndex = index;
          if (filterState.firstNewlyFilteredOutTabIndex === null) {
            filterState.firstNewlyFilteredOutTabIndex = index;
          }
        }
      }

      filterState.tabs[obj.id] = newObj;
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

      if (tabObj.isFilteredOut) {
        transformDelay = 200;
      } else if (!tabObj.isFilteredOut && !tabObj.isNewlyFilteredIn) {
        if (filterState.firstNewlyFilteredInTabIndex !== null) {
          if (filterState.lastNewlyFilteredOutTabIndex !== null) {
            if (
              filterState.firstNewlyFilteredInTabIndex < tabObj.index &&
              filterState.lastNewlyFilteredOutTabIndex > tabObj.index
            ) {
              // if tabs above are filtered in and tabs below are filtered out, delay is needed to allow filtered-out tabs below the time to reach 0 opacity
              transformDelay = 200;
            } else if (
              filterState.firstNewlyFilteredOutTabIndex < tabObj.index
            ) {
              transformDelay = 200;
            }
          }
        } else if (filterState.firstNewlyFilteredOutTabIndex !== null) {
          if (filterState.firstNewlyFilteredOutTabIndex < tabObj.index) {
            transformDelay = 200;
          }
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
          if (filterState.lastNewlyFilteredOutTabIndex !== null) {
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
          state.visibleTabs.push(tab);
          unhideTab(tab);
        }
      });
    });
  };

  util.adjustScrollbar.call(state);
  styleTabs(state.tabs);
  adjustMenu.call(state);
}

module.exports = filter;
