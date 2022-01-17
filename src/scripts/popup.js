const util = require("./modules/util");
const renderTabComponents = require("./modules/renderTabComponents");
const addTab = require("./modules/addTab");
const initializeTabDrag = require("./modules/initializeTabDrag");
const scroll = require("./modules/scroll");
const filter = require("./modules/filter");
const onScroll = require("./modules/onScroll");
const adjustMenu = require("./modules/adjustMenu");

const state = {
  tabList: null,
  tabsArr: [],
  tabs: [],
  tabIndices: {},
  tabIdsByURL: {
    // "https://www.google.com" : ["tab-1", "tab-2", "tab-3"]
  },
  addTab,
  deleteTab(id) {
    const tabListContainer = document.getElementById("tab-list-container");
    this.scrollTop = tabListContainer.scrollTop;
    const tabUrl = this.tabsById[id].url;
    // remove ID of deleted tab from the list of ids associated with tab URL
    this.tabsByURL[tabUrl].ids = this.tabsByURL[tabUrl].ids.filter(
      tabId => tabId != id
    );
    const tabsList = document.getElementById("tab-list");
    const tabsListItem = document.getElementById(id);

    tabsListItem.classList.add("tab--deleted");
    tabsList.classList.add("tab-list--deleting");
    setTimeout(() => {
      // tabsList.classList.add("tab-list--deleting");
      tabsListItem.remove();
      util.adjustBodyPadding();
      util.adjustScrollbar.call(this);
      setTimeout(() => tabsList.classList.remove("tab-list--deleting"), 1400);
      this.scrollTop -= 40;
    }, 1400);
    // if there are no more tabs with this title, tab object can be removed
    if (this.tabsByURL[tabUrl].ids.length == 0) {
      delete this.tabsByURL[tabUrl];
      // if there are fewer than 2 tabs with this title, they are no longer duplicates and don't need their color
    } else if (this.tabsByURL[tabUrl].ids.length < 2) {
      this.availableColors.push(this.tabsByURL[tabUrl].color);
      // remove color and uplicate class from the one remaining tab (the DOM element) with this title
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
    visibleTabs: 0
  },
  scrollState: {
    container: document.getElementById("tab-list-container"),
    scrollbarTrack: document.getElementById("scrollbar-track"),
    scrollbarThumb: document.getElementById("scrollbar-thumb"),
    thumbOffset: 0,
    scrollTop: 0,
    tabListOffset: 0
  }
};

// render tabs
chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, function (
  tabs
) {
  state.tabList = document.getElementById("tab-list");
  tabs.forEach(tab => state.addTab(tab));
  renderTabComponents.call(state);
  util.adjustScrollbar.call(state);
});

// document.addEventListener("pointermove", e => {
//   console.log(e.clientX, e.clientY);
// });

document.addEventListener("click", e => {
  if (e.target.classList.contains("tab__delete-button")) {
    // alert(e.target.parentElement.id);
    const tabListItemId = e.target.parentElement.id;
    state.deleteTab(tabListItemId);
    const tabId = parseInt(tabListItemId.split("-")[1]);
    chrome.tabs.remove(tabId, () => {
      // const tabListItem = document.getElementById(tabListItemId);
      // tabListItem.remove();
    });
    // chrome.tabs.remove(39)
  } else if (e.target.classList.contains("tab__tab-button")) {
    const tabId = parseInt(e.target.parentElement.id.split("-")[1]);
    chrome.tabs.get(tabId, function (tab) {
      chrome.tabs.highlight({ tabs: tab.index }, function () { });
    });
    // chrome.browserAction.openPopup()
  } else if (e.target.id == "move-to-bottom") {
    const tabs = [...document.getElementsByClassName("tab")];
    const selectedTabs = tabs.filter(t => t.children[1].checked);
    selectedTabs.forEach(t => (t.style.background = "red"));
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
    if (e.target.checked) {
      label.classList.add(`tab__checkbox-label--checked`);
      const moveDownButton = document.getElementById("move-to-bottom-btn");
      moveDownButton.removeAttribute("disabled");
      moveDownButton.classList.remove("header__menu-item-button--disabled");
      state.selectedTabs = [...state.selectedTabs, e.target.parentElement];
    } else {
      label.classList.remove(`tab__checkbox-label--checked`);
      state.selectedTabs = state.selectedTabs.filter(
        t => t.id != e.target.parentElement.id
      );
      if (state.selectedTabs.length < 1) {
        // console.log("less than 1");
        const moveDownButton = document.getElementById("move-to-bottom-btn");
        moveDownButton.setAttribute("disabled", true);
        moveDownButton.classList.add("header__menu-item-button--disabled");
      }
    }
  }
});

const tabListContainer = document.getElementById("tab-list-container");
// const scrollBarTrack = document.getElementById("scrollbar-track");

tabListContainer.addEventListener("scroll", onScroll.bind(state));
// tabListContainer.addEventListener(
//   "wheel",
//   function (e) {
//     e.preventDefault();
//     const container = tabListContainer;
//     this.dragState.tabList.style.setProperty("--y-offset", 0 + "px");
//     this.dragState.tabList.classList.remove("tab-list--scroll");
//     const scrollTo =
//       this.scrollState.scrollTop + this.scrollState.tabListOffset;
//     container.scrollBy(0, scrollTo);
//   }.bind(state)
// );
// scrollBarTrack.addEventListener("scroll", onScroll.bind(state));
// document.addEventListener("scroll", onScroll.bind(state));

document.addEventListener("pointerdown", e => {
  // if a tab is clicked
  if (e.target.classList.contains("tab__tab-button")) {
    const tabButton = e.target;
    tabButton.parentElement.classList.add("tab--held-down");
    state.dragTimer = setTimeout(initializeTabDrag.bind(state, e), 300);
    tabButton.onpointerup = () => {
      clearTimeout(state.dragTimer);
    };
  } else if (e.target.id === "scrollbar-thumb") {
    console.log(`scrollbar was clicked!`);
    const scrollBar = e.target;
    initializeScrollbarDrag.bind(state, e);
  }
});

document.addEventListener("contextmenu", e => {
  if (e.target.classList.contains("tab__tab-button")) {
    e.target.parentElement.classList.remove("tab--held-down");
  }
});

document.addEventListener("keyup", e => {
  if (e.target.id == "filter-input") {
    if (e.key != "Tab") {
      filter.call(state);
    }
  }
  // console.log(e.key);
});
