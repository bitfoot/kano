const util = require("./modules/util");
const createTabComponent = require("./modules/createTabComponent");
const addTab = require("./modules/addTab");
const initializeDrag = require("./modules/initializeDrag");
const scroll = require("./modules/scroll");
const filter = require("./modules/filter");
const onScroll = require("./modules/onScroll");
const adjustMenu = require("./modules/adjustMenu");

// before closing browser, call localStorage.removeItem(key) for all the titles, removing everything

// use storage api to store data colors by tab id. Can't store them by URL because that's a security risk.

// colors = {
// 1: null,
// 3: hsl(50, 100, 70)
//
//
//
//
// }
//
// filter = "Youtube"
//
//
//
//

// What to do when:
// Closing tab from chrome: remove color, if applicable, from storage
// Closing tab on popup: smae as above, plus update UI (animate removing tabComponent, remove color from duplicate component if needed)
// Clicking on tab in chrome: nothing. If popup is open, it will close automatically.
// Clicking on tabComponent on the popup: nothing, because popup will close when user is directed to the tab
//
//
//
// when loading popup, get current actual tab Ids, and also remove tabIds from storage that are not present among current tabs
//
//
//
//
//
//

const state = {
  // make sure to save these in localStorage so they persist between tabs
  hue: 0,
  lightness: 60,
  tabLastMovedDown: null,
  tabs: {
    // "tab-12": {
    //   index: tab.index,
    //   url: "https://www.youtube.com"
    // }
  },
  tabIdsByURL: {
    // "https://www.google.com" : ["tab-1", "tab-2", "tab-3"]
  },
  duplicateColorsByURL: {},
  addTab,
  deleteTab(id) {
    const tabListContainer = document.getElementById("tab-list-container");
    this.scrollTop = tabListContainer.scrollTop;
    const tabUrl = this.tabs[id].url;
    // remove ID of deleted tab from the list of ids associated with tab URL
    this.tabsByURL[tabUrl].ids = this.tabsByURL[tabUrl].ids.filter(
      tabId => tabId != id
    );
    const tabsList = document.getElementById("tab-list");
    const tabsListItem = document.getElementById(id);

    tabsListItem.classList.add("tab-list-item--deleted");
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
  availableColors: [],
  renderedTabs: [],
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
    scrollbarTrack: document.getElementById("scrollbar-track"),
    scrollTop: 0,
    specialScrolltop: 0,
    tabListOffset: 0,
    thumbOffset: 0
  }
};

// render tabs
chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, function (
  tabs
) {
  // chrome.tabs.update(tabs[0].id, { url: newUrl });
  // const tabsList = document.getElementById("tabs-list");
  // tabs.forEach(tab => state.addTab(tab.url));
  tabs.forEach(tab => state.addTab(tab));
  util.adjustScrollbar.call(state);
  state.renderedTabs = util.getListedTabs();
  // const tabList = document.getElementById(`tab-list`);
  // const tabListContainer = document.getElementById(`tab-list-container`);
  state.tabListContentHeight = state.renderedTabs.length * 46;
  // if tabList height exceeds parent's height, add a margin to tabList
  // if (state.tabListContentHeight > tabListContainer.offsetHeight) {
  //   state.tabListMargin = state.tabListContentHeight;
  // } else {
  //   state.tabListMargin = 0;
  // }
  // requestAnimationFrame(() => {
  //   tabList.style.setProperty("--tab-list-margin", state.tabListMargin + "px");
  //   tabListContainer.scrollBy(0, state.tabListMargin);
  // });
});

// document.addEventListener("pointermove", e => {
//   console.log(e.clientX, e.clientY);
// });

document.addEventListener("click", e => {
  if (e.target.classList.contains("tab-list-item__delete-button")) {
    // alert(e.target.parentElement.id);
    const tabListItemId = e.target.parentElement.id;
    state.deleteTab(tabListItemId);
    const tabId = parseInt(tabListItemId.split("-")[1]);
    chrome.tabs.remove(tabId, () => {
      // const tabListItem = document.getElementById(tabListItemId);
      // tabListItem.remove();
    });
    // chrome.tabs.remove(39)
  } else if (e.target.classList.contains("tab-list-item__tab-button")) {
    const tabId = parseInt(e.target.parentElement.id.split("-")[1]);
    chrome.tabs.get(tabId, function (tab) {
      chrome.tabs.highlight({ tabs: tab.index }, function () { });
    });
    // chrome.browserAction.openPopup()
  } else if (e.target.id == "move-to-bottom") {
    const tabs = [...document.getElementsByClassName("tab-list-item")];
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
  if (e.target.classList.contains("tab-list-item__checkbox")) {
    const label = e.target.parentElement;
    if (e.target.checked) {
      label.classList.add(`tab-list-item__checkbox-label--checked`);
      const moveDownButton = document.getElementById("move-to-bottom-btn");
      moveDownButton.removeAttribute("disabled");
      moveDownButton.classList.remove("header__menu-item-button--disabled");
      state.selectedTabs = [...state.selectedTabs, e.target.parentElement];
    } else {
      label.classList.remove(`tab-list-item__checkbox-label--checked`);
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
  if (e.target.classList.contains("tab-list-item__tab-button")) {
    const tabButton = e.target;
    tabButton.parentElement.classList.add("tab-list-item--held-down");
    state.dragTimer = setTimeout(initializeDrag.bind(state, e), 300);
    tabButton.onpointerup = () => {
      clearTimeout(state.dragTimer);
    };
  }
});

document.addEventListener("contextmenu", e => {
  if (e.target.classList.contains("tab-list-item__tab-button")) {
    e.target.parentElement.classList.remove("tab-list-item--held-down");
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
