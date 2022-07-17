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
  visibleTabObjects: [],
  tabIndices: {},
  tabIdsByURL: {
    // "https://www.google.com" : ["tab-1", "tab-2", "tab-3"]
  },
  addTab,
  deleteTab(idOfDeletedTab) {
    const tabIndex = this.tabIndices[idOfDeletedTab];
    // console.log(`deleting ${tabIndex}`);
    const tabUrl = this.orderedTabObjects[tabIndex].url;
    // remove ID of deleted tab from the list of ids associated with tab URL
    this.tabIdsByURL[tabUrl] = this.tabIdsByURL[tabUrl].filter(
      tabId => tabId !== idOfDeletedTab
    );
    const reorderedTabObjects = [];
    this.orderedTabObjects.forEach(tabObj => {
      if (tabObj.id !== idOfDeletedTab) {
        if (this.tabIdsByURL[tabObj.url].length < 2) {
          tabObj.isDuplicate = false;
          const tabComponent = document.getElementById(tabObj.id);
          tabComponent.classList.remove("tab--duplicate");
        }
        this.tabIndices[tabObj.id] = reorderedTabObjects.length;
        reorderedTabObjects[this.tabIndices[tabObj.id]] = tabObj;
      }
    });
    this.orderedTabObjects = reorderedTabObjects;
    delete this.tabIndices[idOfDeletedTab];
    // const tabsList = this.tabList;
    const tabsListItem = document.getElementById(idOfDeletedTab);

    tabsListItem.classList.add("tab--deleted");
    // tabsList.classList.add("tab-list--deleting");
    setTimeout(() => {
      tabsListItem.remove();
      const filterWasUsed = this.filterState.numOfFilteredTabs !== null;
      if (filterWasUsed) {
        if (this.filterState.tabs[idOfDeletedTab] !== undefined) {
          this.filterState.numOfFilteredTabs -= 1;
          delete this.filterState.tabs[idOfDeletedTab];
        }
        // const tabsBelow = this.tabs.slice(tabIndex + 1);
        // tabsBelow.forEach(tab => {
        //   this.filterState.tabs[tab.id].filterOffset -= 46;
        //   tab.style.setProperty(
        //     "--y-offset",
        //     this.filterState.tabs[tab.id].filterOffset + "px"
        //   );
        // });
      }
      // the filter offset of all tabs that follow needs to be reduced by 46, as is their --y-offset

      // const updateFilterOffset = () => { };

      this.tabs = this.tabs.filter(tab => tab.id != idOfDeletedTab);
      this.visibleTabObjects = this.visibleTabObjects.filter(
        obj => obj.id != idOfDeletedTab
      );
      util.adjustScrollbar.call(this);
      adjustMenu.call(this);
      // setTimeout(() => tabsList.classList.remove("tab-list--deleting"), 1400);
    }, 300);
    // if there are no more tabs with this URL, tab object can be removed
    if (this.tabIdsByURL[tabUrl].length == 0) {
      delete this.tabIdsByURL[tabUrl];
    }
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
      state.deleteTab(tab.id);
    }
    // const tabId = parseInt(tab.split("-")[1]);
    // chrome.tabs.remove(tabId, () => {
    //   const tabListItem = document.getElementById(tabListItemId);
    //   tabListItem.remove();
    // });
  } else if (e.target.classList.contains("tab__tab-button")) {
    const tabId = parseInt(e.target.parentElement.id.split("-")[1]);
    chrome.tabs.get(tabId, function (tab) {
      chrome.tabs.highlight({ tabs: tab.index }, function () { });
    });
    // chrome.browserAction.openPopup()
  } else if (e.target.id === "select-deselect-all-btn") {
    const allVisibleTabsAreChecked = state.visibleTabs.every(tab => {
      const tabIndex = state.tabIndices[tab.id];
      if (state.orderedTabObjects[tabIndex].isChecked) {
        return true;
      }
    });

    const shouldBeChecked = allVisibleTabsAreChecked ? false : true;
    state.visibleTabs.forEach(tab => {
      const tabIndex = state.tabIndices[tab.id];
      const checkbox = tab.querySelector(".tab__checkbox");
      state.orderedTabObjects[tabIndex].isChecked = shouldBeChecked;
      checkbox.checked = state.orderedTabObjects[tabIndex].isChecked;
    });
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
