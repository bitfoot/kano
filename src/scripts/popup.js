"use strict";

// import util from "./modules/util";
import { enableHeaderControls } from "./modules/util";
import { adjustScrollbar } from "./modules/util";
import { renderTabComponents } from "./modules/renderTabComponents";
import { addTab } from "./modules/addTab";
import { deleteTabs } from "./modules/deleteTabs";
import { initializeTabDrag } from "./modules/initializeTabDrag";
import { moveTabs } from "./modules/moveTabs";
import { initializeScrollbarDrag } from "./modules/initializeScrollbarDrag";
import { filter } from "./modules/filter";
import { onScroll } from "./modules/onScroll";
import { adjustMenu } from "./modules/adjustMenu";

const state = {
  tabList: document.getElementById("tab-list"),
  orderedTabObjects: [],
  tabs: [],
  visibleTabIds: [],
  tabIndices: {},
  tabIdsByURL: {},
  addTab,
  deleteTabs,
  shiftKeyIsDown: null,
  lastCheckedOrUncheckedTabId: null,
  dragState: null,
  moveState: null,
  dragTimer: null,
  clientX: null,
  clientY: null,
  menu: {
    checkedVisibleTabs: [],
    buttons: {
      closeSelected: {
        shouldBeEnabled: false,
        element: null
      },
      moveToTheBottom: {
        shouldBeEnabled: false,
        element: null
      },
      moveToTheTop: {
        shouldBeEnabled: false,
        element: null
      },
      closeDuplicates: {
        shouldBeEnabled: false,
        element: null
      },
      selectDeselectAll: {
        shouldBeEnabled: false,
        element: null
      }
    }
  },
  selectedTabs: [],
  filterState: {
    filterIsActive: false,
    clearFilterBtn: document.getElementById("remove-filter-text-btn"),
    input: document.getElementById("filter-input"),
    tabs: {},
    firstHiddenTabIndex: null,
    lastHiddenTabIndex: null,
    lastVisibleTabIndex: null,
    lastNewlyFilteredOutTabIndex: null,
    firstNewlyFilteredInTabIndex: null
  },
  scrollState: {
    margin: 6,
    tabRowHeight: 46,
    headerHeight: 52,
    maxContainerHeight: 506,
    maxScrollbarThumbOffset: null,
    containerToContentRatio: null,
    scrollbarHeight: null,
    container: document.getElementById("tab-list-container"),
    scrollbarTrack: document.getElementById("scrollbar-track"),
    scrollbarThumb: document.getElementById("scrollbar-thumb"),
    thumbOffset: 0,
    scrollTop: 0,
    maxScrollTop: 0,
    tabListOffset: 0
  }
};

async function getTabs() {
  let queryOptions = { windowId: chrome.windows.WINDOW_ID_CURRENT };
  let tabs = await chrome.tabs.query(queryOptions);
  return tabs;
}

// render tabs
getTabs().then(tabs => {
  tabs.forEach(tab => {
    state.addTab(tab);
  });

  renderTabComponents.call(state);
  // adjustMenu.call(state);
});

document.addEventListener("numberoftabschange", e => {
  adjustMenu.call(state);
  enableHeaderControls.call(state);
  adjustScrollbar.call(state);
});

document.addEventListener("orderoftabschange", e => {
  adjustMenu.call(state);
  enableHeaderControls.call(state);
});

document.addEventListener("click", e => {
  if (e.target.id === "close-duplicates-btn") {
    // const tabIdsToDelete = [];
    const idsByURL = state.visibleTabIds.reduce((a, id) => {
      const browserIndex = state.tabIndices[id][0];
      const URL = state.orderedTabObjects[browserIndex].url;
      if (!a[URL]) {
        a[URL] = [id];
      } else {
        a[URL].push(id);
      }
      return a;
    }, {});

    const unluckyTabIds = Object.values(idsByURL).reduce((a, idsArr) => {
      if (idsArr.length > 1) {
        let luckyTabInfo = null;
        idsArr.forEach(id => {
          const index = state.tabIndices[id][0];
          const tabObj = {
            id,
            isActive: state.orderedTabObjects[index].isActive,
            isPinned: state.orderedTabObjects[index].isPinned
          };
          if (luckyTabInfo === null) {
            luckyTabInfo = tabObj;
          } else {
            if (luckyTabInfo.isActive) {
              a[id] = true;
            } else if (tabObj.isActive) {
              a[luckyTabInfo.id] = true;
              luckyTabInfo = tabObj;
            } else if (
              Number(luckyTabInfo.isPinned) >= Number(tabObj.isPinned)
            ) {
              a[id] = true;
            } else {
              a[luckyTabInfo.id] = true;
              luckyTabInfo = tabObj;
            }
          }
        });
      }
      return a;
    }, {});
    const tabIdsToDelete = state.visibleTabIds.filter(id => unluckyTabIds[id]);
    // console.log(tabIdsToDelete);
    deleteTabs.call(state, tabIdsToDelete);
  } else if (e.target.classList.contains("tab__close-tab-button")) {
    const tab = e.target.parentElement;
    if (!tab.classList.contains("tab--deleted")) {
      deleteTabs.call(state, [tab.id]);
    }
  } else if (e.target.id === "select-deselect-all-btn") {
    const allVisibleTabsAreChecked = state.visibleTabIds.every(id => {
      const tabIndex = state.tabIndices[id][0];
      if (state.orderedTabObjects[tabIndex].isChecked) {
        return true;
      }
    });

    const shouldBeChecked = allVisibleTabsAreChecked ? false : true;
    state.visibleTabIds.forEach(id => {
      const tabIndex = state.tabIndices[id][0];
      // const checkbox = state.tabs[tabIndex].children[1].firstChild;
      const checkbox = state.tabs[tabIndex].querySelector(".tab__checkbox");
      state.orderedTabObjects[tabIndex].isChecked = shouldBeChecked;
      checkbox.checked = shouldBeChecked;
    });
    state.lastCheckedOrUncheckedTabId = null;
    adjustMenu.call(state);
  } else if (e.target.id === "close-selected-btn") {
    const tabIds = state.visibleTabIds.filter(id => {
      const obj = state.orderedTabObjects[state.tabIndices[id][0]];
      if (obj.isChecked) {
        return true;
      }
    });
    deleteTabs.call(state, tabIds);
  } else if (e.target.id === "move-to-top-btn") {
    moveTabs.call(state, "top");
    // adjustMenu.call(state);
  } else if (e.target.id === "move-to-bottom-btn") {
    moveTabs.call(state, "bottom");
    // adjustMenu.call(state);
  } else if (e.target.id === "remove-filter-text-btn") {
    const filterInput = state.filterState.input;
    filterInput.value = "";
    filter.call(state);
  }
});

document.addEventListener(`input`, e => {
  if (e.target.classList.contains("tab__checkbox")) {
    // console.log(state.shiftKeyIsDown);
    const label = e.target.parentElement;
    const tabId = label.parentElement.id;
    const tabIndex = state.tabIndices[tabId][0];
    if (state.shiftKeyIsDown) {
      // check/uncheck all visible tabs between shiftCheckedTabIndex and tabIndex
      // find out if lastCheckedTabId belongs to a visible tab
      if (state.lastCheckedOrUncheckedTabId === null) {
        state.lastCheckedOrUncheckedTabId = tabId;
      }
      const lastCheckedOrUncheckedTabVisibleIndex =
        state.tabIndices[state.lastCheckedOrUncheckedTabId][1];
      if (lastCheckedOrUncheckedTabVisibleIndex !== null) {
        // const lastCheckedOrUncheckedTabIndex =
        //   state.tabIndices[state.lastCheckedOrUncheckedTabId][0];
        const tabVisibleIndex = state.tabIndices[tabId][1];
        let idsOfTabsToAffect;
        let newlyCheckedOrUncheckedTabs;
        if (tabVisibleIndex < lastCheckedOrUncheckedTabVisibleIndex) {
          idsOfTabsToAffect = state.visibleTabIds.slice(
            tabVisibleIndex,
            lastCheckedOrUncheckedTabVisibleIndex + 1
          );

          newlyCheckedOrUncheckedTabs = idsOfTabsToAffect.slice(
            0,
            idsOfTabsToAffect.length - 1
          );
        } else if (tabVisibleIndex > lastCheckedOrUncheckedTabVisibleIndex) {
          idsOfTabsToAffect = state.visibleTabIds.slice(
            lastCheckedOrUncheckedTabVisibleIndex,
            tabVisibleIndex + 1
          );

          newlyCheckedOrUncheckedTabs = idsOfTabsToAffect.slice(1);
        } else {
          idsOfTabsToAffect = [tabId];
          newlyCheckedOrUncheckedTabs = [tabId];
        }
        // const lastCheckedOrUncheckedTabIsChecked =
        //   state.orderedTabObjects[lastCheckedOrUncheckedTabIndex].isChecked;
        const someTabsAreUnchecked = newlyCheckedOrUncheckedTabs.some(id => {
          const index = state.tabIndices[id][0];
          if (state.orderedTabObjects[index].isChecked === false) {
            return true;
          }
        });
        let shouldBeChecked;
        if (someTabsAreUnchecked) {
          shouldBeChecked = true;
        } else {
          shouldBeChecked = false;
        }
        idsOfTabsToAffect.forEach(id => {
          const index = state.tabIndices[id][0];
          state.orderedTabObjects[index].isChecked = shouldBeChecked;
          state.tabs[index].children[1].firstChild.checked = shouldBeChecked;
        });
      }
    }
    state.lastCheckedOrUncheckedTabId = tabId;
    if (e.target.checked) {
      label.classList.add(`tab__checkbox-label--checked`);
      state.orderedTabObjects[tabIndex].isChecked = true;
    } else {
      label.classList.remove(`tab__checkbox-label--checked`);
      state.orderedTabObjects[tabIndex].isChecked = false;
    }
    adjustMenu.call(state);
  } else if (e.target.id === "filter-input") {
    filter.call(state);
  }
});

state.scrollState.container.addEventListener("scroll", onScroll.bind(state));

document.addEventListener("pointerdown", e => {
  // if the left mouse button was clicked, we don't need to do anything
  if (e.pointerType === "mouse" && e.buttons !== 1) {
    return;
  }
  if (e.target.classList.contains("tab__tab-button")) {
    const tabButton = e.target;
    const parent = tabButton.parentElement;
    const pointerId = e.pointerId;
    tabButton.setPointerCapture(pointerId);
    const bounds = parent.getBoundingClientRect();
    parent.classList.add("tab--held-down");

    requestAnimationFrame(() => {
      parent.style.setProperty("--x-pos", e.clientX - bounds.left + "px");
      parent.style.setProperty("--y-pos", e.clientY - bounds.top + "px");
    });

    state.dragTimer = setTimeout(initializeTabDrag.bind(state, e), 320);
    tabButton.onpointerup = () => {
      clearTimeout(state.dragTimer);
      tabButton.onpointerup = null;
      tabButton.releasePointerCapture(pointerId);
      if (state.dragState === null) {
        parent.classList.remove("tab--held-down");
        const tabId = parent.id;
        const browserTabId = parseInt(tabId.split("-")[1]);
        chrome.tabs.get(browserTabId, function (tab) {
          chrome.tabs.highlight({ tabs: tab.index }, function () { });
        });
      }
    };
  } else if (e.target.id === "scrollbar-thumb") {
    initializeScrollbarDrag.call(state, e);
  } else if (e.target.id === "scrollbar-track") {
    const pointerYPos = e.pageY;
    const posOnTrack = pointerYPos - state.scrollState.headerHeight;
    const trackRatio = posOnTrack / state.scrollState.scrollbarTrackSpace;
    const scrollDistance = state.scrollState.maxScrollTop * trackRatio;
    state.scrollState.container.scroll({
      top: scrollDistance,
      left: 0,
      behavior: "smooth"
    });
  }
});

document.addEventListener(`keydown`, e => {
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
    state.shiftKeyIsDown = true;
  }
  if (e.code !== "Space" && e.code !== "Enter") return;
  if (
    e.target.classList.contains("tab__tab-button") &&
    state.dragState === null
  ) {
    const tabButton = e.target;
    tabButton.parentElement.classList.add("tab--held-down");
    state.dragTimer = setTimeout(initializeTabDrag.bind(state, e), 320);
    tabButton.onkeyup = () => {
      clearTimeout(state.dragTimer);
      tabButton.onkeyup = "";
      if (state.dragState === null) {
        tabButton.parentElement.classList.remove("tab--held-down");
        const tabId = e.target.parentElement.id;
        const browserTabId = parseInt(tabId.split("-")[1]);
        chrome.tabs.get(browserTabId, function (tab) {
          chrome.tabs.highlight({ tabs: tab.index }, function () { });
        });
      }
    };
  }
});

document.addEventListener(`keyup`, e => {
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
    state.shiftKeyIsDown = false;
  }
});

document.addEventListener("pointermove", e => {
  if (state.dragState) return;
  requestAnimationFrame(() => {
    document.documentElement.style.setProperty(
      "--pointer-x-pos",
      e.clientX + "px"
    );
    document.documentElement.style.setProperty(
      "--pointer-y-pos",
      e.clientY + "px"
    );
  });
  if (e.target.classList.contains("tab__tab-button")) {
    const tabButton = e.target;
    const parent = tabButton.parentElement;
    if (parent.classList.contains("tab--deleted")) {
      return;
    }
    const visibleIndex = state.tabIndices[parent.id][1];
    const posInList = visibleIndex * state.scrollState.tabRowHeight;
    const top =
      state.scrollState.headerHeight + posInList - state.scrollState.scrollTop;

    requestAnimationFrame(() => {
      parent.style.setProperty("--bounds-top", top + "px");
    });
  } else if (e.target.classList.contains("menu-item-btn")) {
    const bounds = e.target.getBoundingClientRect();
    requestAnimationFrame(() => {
      e.target.style.setProperty("--bounds-left", bounds.left + "px");
    });
  }
});

document.addEventListener("contextmenu", e => {
  if (e.target.classList.contains("tab__tab-button")) {
    e.target.parentElement.classList.remove("tab--held-down");
    if (state.dragState !== null) {
      state.dragState.onTabDragEnd.call(state);
    }
  }
});
