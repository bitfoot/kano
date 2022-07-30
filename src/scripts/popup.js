const util = require("./modules/util");
const renderTabComponents = require("./modules/renderTabComponents");
const addTab = require("./modules/addTab");
const initializeTabDrag = require("./modules/initializeTabDrag");
const initializeScrollbarDrag = require("./modules/initializeScrollbarDrag");
const scroll = require("./modules/scroll");
const filter = require("./modules/filter");
const onScroll = require("./modules/onScroll");
const adjustMenu = require("./modules/adjustMenu");

const state = {
  tabList: document.getElementById("tab-list"),
  orderedTabObjects: [],
  tabs: [],
  // { id, indexInTabs}
  visibleTabIds: [],
  hiddenTabIds: [],

  tabIndices: {},
  tabIdsByURL: {
    // "https://www.google.com" : ["tab-1", "tab-2", "tab-3"]
  },
  addTab,
  deleteTabs(idsOfTabsToDelete) {
    const tabsToDelete = idsOfTabsToDelete.reduce((a, id) => {
      const index = this.tabIndices[id];
      delete this.tabIndices[id];
      const URL = this.orderedTabObjects[index].url;
      this.tabIdsByURL[URL] = this.tabIdsByURL[URL].filter(
        tabId => tabId !== id
      );
      if (this.tabIdsByURL[URL].length == 0) {
        delete this.tabIdsByURL[URL];
      }
      a[id] = this.tabs[index];
      return a;
    }, {});

    const reorderedTabObjects = [];
    let numDeleted = 0;
    this.orderedTabObjects.forEach((obj, i) => {
      if (!tabsToDelete[obj.id]) {
        if (this.tabIdsByURL[obj.url].length < 2) {
          obj.isDuplicate = false;
          this.tabs[i].classList.remove("tab--duplicate");
        }
        this.tabIndices[obj.id] = reorderedTabObjects.length;
        reorderedTabObjects[this.tabIndices[obj.id]] = obj;
        const deletedOffset = numDeleted * -46 + "px";
        this.tabs[i].style.setProperty("--deleted-offset", deletedOffset);
      } else {
        numDeleted += 1;
        this.tabs[i].classList.add("tab--deleted");
      }
    });

    this.orderedTabObjects = reorderedTabObjects;

    setTimeout(() => {
      Object.entries(tabsToDelete).forEach(entry => {
        const id = entry[0];
        const tab = entry[1];
        requestAnimationFrame(() => {
          tab.remove();
        });
        const filterWasUsed = this.filterState.numOfFilteredTabs !== null;
        if (filterWasUsed) {
          if (this.filterState.tabs[id] !== undefined) {
            this.filterState.numOfFilteredTabs -= 1;
            delete this.filterState.tabs[id];
          }
        }
      });
      this.tabs = this.tabs.filter(tab => !tabsToDelete[tab.id]);
      this.visibleTabIds = this.visibleTabIds.filter(id => !tabsToDelete[id]);
      adjustMenu.call(this);
      util.adjustScrollbar.call(this);
    }, 200);
  },
  // have to keep order of all tab Ids so that they can be moved on UI (before actual browser tabs are moved)
  dragState: null,
  dragTimer: null,
  maxScrollbarThumbOffset: 0,
  totalFilteredOutTabs: 0,
  lastFilteredOutTabs: 0,
  filteredInTabs: 0,
  filterIsActive: false,
  selectedTabs: [],
  filterState: {
    filterIsActive: false,
    input: document.getElementById("filter-input"),
    tabs: {},
    numOfFilteredTabs: null,
    firstHiddenTabIndex: null,
    lastHiddenTabIndex: null,
    firstVisibleTabIndex: null,
    lastVisibleTabIndex: null,
    firstNewlyFilteredOutTabIndex: null,
    lastNewlyFilteredOutTabIndex: null,
    firstNewlyFilteredInTabIndex: null,
    lastNewlyFilteredInTabIndex: null,
    lastMatchedTabIndex: null,
    scrollingUp: false
  },
  scrollState: {
    maxScrollbarThumbOffset: null,
    containerToContentRatio: null,
    headerHeight: 52,
    maxContainerHeight: 506,
    container: document.getElementById("tab-list-container"),
    scrollbarTrack: document.getElementById("scrollbar-track"),
    scrollbarThumb: document.getElementById("scrollbar-thumb"),
    thumbOffset: 0,
    scrollTop: 0,
    maxScrollTop: 0,
    tabListOffset: 0
  }
};

// render tabs
chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, function (
  tabs
) {
  tabs.forEach(tab => state.addTab(tab));
  renderTabComponents.call(state);
  util.adjustScrollbar.call(state);
  adjustMenu.call(state);
});

// document.addEventListener("pointermove", e => {
//   console.log(e.clientX, e.clientY);
// });

document.addEventListener("click", e => {
  if (e.target.classList.contains("tab__delete-button")) {
    // alert(e.target.parentElement.id);
    const tab = e.target.parentElement;
    if (!tab.classList.contains("tab--deleted")) {
      state.deleteTabs([tab.id]);
    }
    // const tabId = parseInt(tab.split("-")[1]);
    // chrome.tabs.remove(tabId, () => {
    //   const tabListItem = document.getElementById(tabListItemId);
    //   tabListItem.remove();
    // });
  } else if (e.target.classList.contains("tab__tab-button")) {
    const tabId = e.target.parentElement.id;
    const index = state.tabIndices[tabId];
    if (!state.orderedTabObjects[index].isActive) {
      const browserTabId = parseInt(e.target.parentElement.id.split("-")[1]);
      chrome.tabs.get(browserTabId, function (tab) {
        chrome.tabs.highlight({ tabs: tab.index }, function () { });
      });
    }
  } else if (e.target.id === "select-deselect-all-btn") {
    const allVisibleTabsAreChecked = state.visibleTabIds.every(id => {
      const tabIndex = state.tabIndices[id];
      if (state.orderedTabObjects[tabIndex].isChecked) {
        return true;
      }
    });

    const shouldBeChecked = allVisibleTabsAreChecked ? false : true;
    state.visibleTabIds.forEach(id => {
      const tabIndex = state.tabIndices[id];
      // const checkbox = state.tabs[tabIndex].children[1].firstChild;
      const checkbox = state.tabs[tabIndex].querySelector(".tab__checkbox");
      state.orderedTabObjects[tabIndex].isChecked = shouldBeChecked;
      checkbox.checked = shouldBeChecked;
    });
    adjustMenu.call(state);
  } else if (e.target.id == "close-selected-btn") {
    const tabIds = state.visibleTabIds.filter(id => {
      const obj = state.orderedTabObjects[state.tabIndices[id]];
      if (obj.isChecked) {
        return true;
      }
    });
    state.deleteTabs(tabIds);
  } else if (e.target.id == "remove-filter-text-btn") {
    const filterInput = document.getElementById("filter-input");
    filterInput.classList.add("filter__input--cleared");
    setTimeout(() => {
      filterInput.value = "";
      filter.call(state);
      filterInput.classList.remove("filter__input--cleared");
    }, 140);
  }
});

document.addEventListener(`input`, e => {
  if (e.target.classList.contains("tab__checkbox")) {
    const label = e.target.parentElement;
    const tabId = label.parentElement.id;
    const tabIndex = state.tabIndices[tabId];
    if (e.target.checked) {
      label.classList.add(`tab__checkbox-label--checked`);
      state.orderedTabObjects[tabIndex].isChecked = true;
    } else {
      label.classList.remove(`tab__checkbox-label--checked`);
      state.orderedTabObjects[tabIndex].isChecked = false;
    }
    adjustMenu.call(state);
  } else if (e.target.id == "filter-input") {
    filter.call(state);
  }
});

state.scrollState.container.addEventListener("scroll", onScroll.bind(state));

document.addEventListener("pointerdown", e => {
  if (e.target.classList.contains("tab__tab-button")) {
    const tabButton = e.target;
    tabButton.parentElement.classList.add("tab--held-down");
    state.dragTimer = setTimeout(initializeTabDrag.bind(state, e), 300);
    tabButton.onpointerup = () => {
      clearTimeout(state.dragTimer);
      tabButton.parentElement.classList.remove("tab--held-down");
    };
  } else if (e.target.id === "scrollbar-thumb") {
    initializeScrollbarDrag.call(state, e);
  } else if (e.target.id == "scrollbar-track") {
    const pointerPos = e.pageY;
    const posOnTrack = pointerPos - state.scrollState.headerHeight;
    const trackRatio = posOnTrack / state.scrollState.scrollbarTrackSpace;
    const scrollDistance = state.scrollState.maxScrollTop * trackRatio;
    state.scrollState.container.scroll({
      top: scrollDistance,
      left: 0,
      behavior: "smooth"
    });
  }
});

document.addEventListener("contextmenu", e => {
  if (e.target.classList.contains("tab__tab-button")) {
    e.target.parentElement.classList.remove("tab--held-down");
  }
});

// document.addEventListener("keyup", e => {
//   if (e.target.id == "filter-input") {
//     if (e.key !== "Tab") {
//       filter.call(state);
//     }
//   }
//   // console.log(e.key);
// });
