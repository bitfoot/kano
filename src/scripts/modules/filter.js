"use strict";

const util = require("./util");
const adjustMenu = require("./adjustMenu");

function filter() {
  const state = this;
  const filterState = state.filterState;
  const filterString = filterState.input.value.toLowerCase();
  const filter = document.getElementById("filter");
  if (filterString.length !== 0) {
    window.requestAnimationFrame(() => {
      filter.classList.add("filter--active");
    });
  } else {
    window.requestAnimationFrame(() => {
      filter.classList.remove("filter--active");
    });
  }
  state.visibleTabIds = [];
  const TAB_ROW_HEIGHT = 46;

  const matchesFilter = (title, filterString) => {
    return title.toLowerCase().includes(filterString);
  };

  const prepareFilteredTabObjects = tabObjects => {
    filterState.numOfFilteredTabs = 0;
    filterState.firstHiddenTabIndex = null;
    filterState.lastHiddenTabIndex = null;
    filterState.lastVisibleTabIndex = null;
    filterState.lastNewlyFilteredOutTabIndex = null;
    filterState.firstNewlyFilteredInTabIndex = null;
    filterState.newlyFilteredOut = 0;
    let filteredOutAbove = 0;
    let filteredIndex = 0;

    tabObjects.forEach((obj, index) => {
      const newFilterOffset = filteredOutAbove * TAB_ROW_HEIGHT * -1;
      const newFilteredTabObj = {
        index,
        filteredIndex: null,
        isNewlyFilteredIn: false,
        isNewlyFilteredOut: false,
        isFilteredOut: false,
        filterOffset: newFilterOffset,
        newlyFilteredOutAbove: filterState.newlyFilteredOut
      };

      const matches = matchesFilter(obj.title, filterString);

      // if tab was filtered previously, see if it was previously filtered out (hidden)
      // and whether it has to be moved
      let wasFilteredOut = false;
      if (filterState.tabs[obj.id] !== undefined) {
        wasFilteredOut = filterState.tabs[obj.id].isFilteredOut;
      }

      if (matches) {
        state.visibleTabIds.push(obj.id);
        state.tabIndices[obj.id][1] = filteredIndex;
        newFilteredTabObj.filteredIndex = filteredIndex;
        filteredIndex += 1;
        // obj.isVisible = true;
        filterState.numOfFilteredTabs += 1;
        if (wasFilteredOut) {
          newFilteredTabObj.isNewlyFilteredIn = true;
          if (filterState.firstNewlyFilteredInTabIndex === null) {
            filterState.firstNewlyFilteredInTabIndex = index;
          }
        } else {
          filterState.lastVisibleTabIndex = index;
        }
      } else {
        // obj.isVisible = false;
        state.tabIndices[obj.id][1] = null;
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
      window.requestAnimationFrame(() => {
        tab.classList.add("tab--filtered-out");
      });
    }
    if (tab.classList.contains("tab--filtered")) {
      window.requestAnimationFrame(() => {
        tab.classList.remove("tab--filtered");
      });
    }
    tab.setAttribute("disabled", true);
  };

  const unhideTab = tab => {
    tab.ariaHidden = "false";
    if (!tab.classList.contains("tab--filtered")) {
      window.requestAnimationFrame(() => {
        tab.classList.add("tab--filtered");
      });
    }
    if (tab.classList.contains("tab--filtered-out")) {
      window.requestAnimationFrame(() => {
        tab.classList.remove("tab--filtered-out");
      });
    }
    tab.removeAttribute("disabled");
  };

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
        opacityDelay = 0;
      } else if (!tabObj.isFilteredOut && !tabObj.isNewlyFilteredIn) {
        // if current tab is already visible and not filtered out
        opacityDelay = 0;
      } else if (tabObj.isNewlyFilteredIn) {
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

  requestAnimationFrame(() => {
    if (filterString.length > 0) {
      filterState.clearFilterBtn.classList.remove(
        "filter__remove-text-btn--disabled"
      );
      filterState.clearFilterBtn.removeAttribute("disabled");
    } else {
      filterState.clearFilterBtn.classList.add(
        "filter__remove-text-btn--disabled"
      );
      filterState.clearFilterBtn.setAttribute("disabled", true);
      filterState.input.focus();
    }
  });

  adjustMenu.call(state);
  util.adjustScrollbar.call(state);
  styleTabs(state.tabs);
}

module.exports = filter;
