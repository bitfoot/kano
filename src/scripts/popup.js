"use strict";

import { enableHeaderControls } from "./modules/util";
import { adjustScrollbar } from "./modules/util";
import { renderTabComponents } from "./modules/renderTabComponents";
import { addTab } from "./modules/addTab";
import { deleteTabs } from "./modules/deleteTabs";
import { initializeTabDrag } from "./modules/initializeTabDrag";
import { moveTabs } from "./modules/moveTabs";
import { moveToNewWindow } from "./modules/moveToNewWindow";
import { initializeScrollbarDrag } from "./modules/initializeScrollbarDrag";
import { filter } from "./modules/filter";
import { onScroll } from "./modules/onScroll";
import { adjustMenu } from "./modules/adjustMenu";
import { getTabTopBound } from "./modules/util";
import { highlightBrowserTab } from "./modules/util";

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
  menu: {
    checkedVisibleTabs: [],
    lastPinnedTabIndex: null,
    firstUnpinnedTabIndex: null,
    buttons: {
      moveToNewWindow: {
        shouldBeEnabled: false,
        element: null
      },
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
  filterState: {
    filterIsActive: false,
    clearFilterBtn: document.getElementById("remove-filter-text-btn"),
    input: document.getElementById("filter-input"),
    tabs: {},
    firstHiddenUnpinnedTabIndex: null,
    lastHiddenUnpinnedTabIndex: null,
    firstHiddenPinnedTabIndex: null,
    lastHiddenPinnedTabIndex: null,
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
});

document.addEventListener("numberoftabschange", () => {
  adjustMenu.call(state);
  adjustScrollbar.call(state);
  enableHeaderControls.call(state);
});

document.addEventListener("numberoftabschangestart", () => {
  adjustScrollbar.call(state);
});

document.addEventListener("numberoftabschangeend", () => {
  adjustMenu.call(state);
  enableHeaderControls.call(state);
});

document.addEventListener("orderoftabschange", () => {
  adjustMenu.call(state);
  enableHeaderControls.call(state);
});

document.addEventListener("click", e => {
  if (e.target.id === "close-duplicates-btn") {
    const unluckyTabIds = Object.values(state.tabIdsByURL).reduce(
      (a, idsArr) => {
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
      },
      {}
    );
    const tabIdsToDelete = state.visibleTabIds.filter(id => unluckyTabIds[id]);
    deleteTabs.call(state, { tabComponentIds: tabIdsToDelete });
  } else if (e.target.classList.contains("tab__close-tab-button")) {
    const tab = e.target.parentElement;
    if (!tab.classList.contains("tab--deleted")) {
      deleteTabs.call(state, { tabComponentIds: [tab.id] });
    }
  } else if (e.target.id === "select-deselect-all-btn") {
    if (state.visibleTabIds.length === 0) return;
    const uncheckedVisibleTabsExist = state.visibleTabIds.some(id => {
      const tabIndex = state.tabIndices[id][0];
      if (state.orderedTabObjects[tabIndex].isChecked === false) {
        return true;
      }
    });

    const shouldBeChecked = uncheckedVisibleTabsExist ? true : false;
    state.visibleTabIds.forEach(id => {
      const tabIndex = state.tabIndices[id][0];
      const checkbox = state.tabs[tabIndex].children[1].firstChild;
      state.orderedTabObjects[tabIndex].isChecked = shouldBeChecked;
      checkbox.checked = shouldBeChecked;
    });
    state.lastCheckedOrUncheckedTabId = null;
    adjustMenu.call(state);
  } else if (e.target.id === "close-selected-btn") {
    const tabIds = state.visibleTabIds.filter(id => {
      const index = state.tabIndices[id][0];
      return state.orderedTabObjects[index].isChecked;
    });
    deleteTabs.call(state, { tabComponentIds: tabIds });
  } else if (e.target.id === "move-to-top-btn") {
    moveTabs.call(state, "top");
  } else if (e.target.id === "move-to-bottom-btn") {
    moveTabs.call(state, "bottom");
  } else if (e.target.id === "move-to-new-window-btn") {
    moveToNewWindow.call(state);
  } else if (e.target.id === "remove-filter-text-btn") {
    const filterInput = state.filterState.input;
    filterInput.value = "";
    filter.call(state);
  }
});

document.addEventListener(`input`, e => {
  if (e.target.classList.contains("tab__checkbox")) {
    const label = e.target.parentElement;
    const tabId = label.parentElement.id;
    const tabIndex = state.tabIndices[tabId][0];
    if (state.shiftKeyIsDown) {
      if (state.lastCheckedOrUncheckedTabId === null) {
        state.lastCheckedOrUncheckedTabId = tabId;
      }
      const lastCheckedOrUncheckedTabVisibleIndex =
        state.tabIndices[state.lastCheckedOrUncheckedTabId][1];
      if (lastCheckedOrUncheckedTabVisibleIndex !== null) {
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

document.addEventListener("pointerdown", e => {
  // if the left mouse button was clicked, we don't need to do anything
  if (e.pointerType === "mouse" && e.buttons !== 1) return;
  if (e.target.classList.contains("tab__tab-button")) {
    const tabButton = e.target;
    if (e.pointerType === "touch") {
      tabButton.focus();
    }
    const tab = tabButton.parentElement;
    const pointerId = e.pointerId;
    tabButton.setPointerCapture(pointerId);
    requestAnimationFrame(() => {
      tab.classList.add("tab--held-down");
    });

    tabButton.onanimationend = event => {
      if (event.animationName === "heldDown") {
        initializeTabDrag.call(state, e);
      }
    };
    tabButton.onpointerup = () => {
      tabButton.onpointerup = null;
      tabButton.releasePointerCapture(pointerId);
      if (state.dragState !== null) return;

      requestAnimationFrame(() => {
        tab.classList.remove("tab--held-down");
      });
      highlightBrowserTab(tab.id);
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
    const eventCode = e.code;
    const tabButton = e.target;
    const tab = tabButton.parentElement;
    const halfTabHeight = 20;
    const boundsTop = getTabTopBound.call(state, tab);

    requestAnimationFrame(() => {
      tab.style.setProperty("--bounds-top", boundsTop + "px");
      document.documentElement.style.setProperty(
        "--pointer-y-pos",
        boundsTop + halfTabHeight + "px"
      );
      tab.classList.add("tab--held-down");
    });

    tabButton.onanimationend = event => {
      if (event.animationName === "heldDown") {
        initializeTabDrag.call(state, e);
      }
    };
    tabButton.onkeyup = event => {
      if (event.code === eventCode) {
        tabButton.onkeyup = "";
        if (state.dragState !== null) {
          return;
        }
        requestAnimationFrame(() => {
          tab.classList.remove("tab--held-down");
        });
        highlightBrowserTab(tab.id);
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
    const tab = tabButton.parentElement;
    if (
      tab.classList.contains("tab--deleted") ||
      tab.classList.contains("tab--moved-out")
    ) {
      return;
    }

    requestAnimationFrame(() => {
      tab.style.setProperty(
        "--bounds-top",
        getTabTopBound.call(state, tab) + "px"
      );
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

state.scrollState.container.addEventListener("scroll", onScroll.bind(state));
