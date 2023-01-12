"use strict";

// const adjustMenu = require("./adjustMenu");
// const adjustScrollbar = require("./util").adjustScrollbar;
import { resetTabCSSVariables } from "./util";
import { disableHeaderControls } from "./util";

function deleteTabs(options = {}) {
  const {
    tabComponentIds = [],
    browserTabIds = [],
    movingToNewWindow = false,
    createData,
    newWindowIsToTheRight = false
  } = options;

  if (tabComponentIds.length === 0) return;
  disableHeaderControls.call(this);
  resetTabCSSVariables(this.tabs);

  const tabsToDelete = tabComponentIds.reduce((a, id) => {
    const index = this.tabIndices[id][0];
    const URL = this.orderedTabObjects[index].url;
    this.tabIdsByURL[URL] = this.tabIdsByURL[URL].filter(tabId => tabId !== id);
    if (this.tabIdsByURL[URL].length === 0) {
      delete this.tabIdsByURL[URL];
    }
    a[id] = this.tabs[index];
    return a;
  }, {});

  const reorderedTabObjects = [];
  let numDeleted = 0;
  let maxChangeInPosition = 0;
  let firstHiddenTabIndex = null;
  let firstDeletedTab = null;
  let firstVisibleTabBelowDeletedTab = null;
  const remainingVisibleTabIds = [];
  const remainingTabs = [];
  let sign = 0;
  if (movingToNewWindow) {
    sign = newWindowIsToTheRight === true ? 1 : -1;
  }

  const finishTabDeletion = () => {
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

    // move tabs to a new window if needed
    if (movingToNewWindow === true && createData !== undefined) {
      chrome.windows.create(createData).then(windowData => {
        const windowId = windowData.id;
        const remainingTabIds = browserTabIds.slice(1);
        if (remainingTabIds.length > 0) {
          chrome.tabs.move(remainingTabIds, {
            windowId,
            index: 1
          });
        }
      });
    }

    const event = new Event("numberoftabschangeend", { bubbles: true });
    this.tabList.dispatchEvent(event);
  };

  this.orderedTabObjects.forEach((obj, i) => {
    const tab = this.tabs[i];
    if (!tabsToDelete[obj.id]) {
      if (this.tabIdsByURL[obj.url].length < 2) {
        obj.isDuplicate = false;
        window.requestAnimationFrame(() => {
          tab.classList.remove("tab--duplicate");
        });
      }

      remainingTabs.push(tab);
      // update tab's browser index and calculate offset
      this.tabIndices[obj.id][0] = reorderedTabObjects.length;

      // if tab is not hidden, update its visible index
      if (this.tabIndices[obj.id][1] !== null) {
        if (firstVisibleTabBelowDeletedTab === null && numDeleted > 0) {
          firstVisibleTabBelowDeletedTab = tab;
        }
        const deletedOffset = numDeleted * -46;
        window.requestAnimationFrame(() => {
          tab.style.setProperty("--deleted-offset", deletedOffset + "px");
        });
        maxChangeInPosition = deletedOffset;
        this.tabIndices[obj.id][1] -= numDeleted;
        remainingVisibleTabIds.push(obj.id);
      } else {
        // update lastHiddenTabIndex in filterState, in case it changed
        this.filterState.lastHiddenTabIndex = this.tabIndices[obj.id][0];
        if (firstHiddenTabIndex === null) {
          firstHiddenTabIndex = this.tabIndices[obj.id][0];
        }
      }

      reorderedTabObjects[this.tabIndices[obj.id][0]] = obj;
    } else {
      if (numDeleted === 0) {
        firstDeletedTab = tab;
      }
      if (this.lastCheckedOrUncheckedTabId === tab.id) {
        this.lastCheckedOrUncheckedTabId = null;
      }
      numDeleted += 1;
      browserTabIds.push(parseInt(tab.id.split("-")[1]));
      window.requestAnimationFrame(() => {
        if (movingToNewWindow === true) {
          tab.style.setProperty("--sign", sign);
          tab.classList.add("tab--moved-out");
        } else {
          tab.classList.add("tab--deleted");
          // tab.style.setProperty("--opacity", 0);
        }
        // tab.classList.add("tab--deleted");
        delete this.tabIndices[obj.id];
      });
    }
  });

  if (movingToNewWindow === false) {
    // remove browser tabs
    const removeBrowserTabs = async function (browserTabIds) {
      try {
        await chrome.tabs.remove(browserTabIds);
      } catch (error) {
        console.error(error);
      }
    };
    removeBrowserTabs(browserTabIds);
  }

  // update firstHiddenTabIndex, in case it changed
  this.filterState.firstHiddenTabIndex = firstHiddenTabIndex;
  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = remainingVisibleTabIds;

  const animationDuration = Math.min(
    Math.max(Math.abs(maxChangeInPosition) * 2.174, 100),
    240
  );

  if (firstVisibleTabBelowDeletedTab !== null) {
    firstVisibleTabBelowDeletedTab.onanimationend = e => {
      if (e.animationName === "belowDeleted") {
        finishTabDeletion.call(this);
      }
    };
  } else {
    firstDeletedTab.ontransitionend = e => {
      if (e.propertyName === "opacity") {
        finishTabDeletion.call(this);
      }
    };
  }

  window.requestAnimationFrame(() => {
    document.documentElement.style.setProperty(
      "--animation-duration",
      animationDuration + "ms"
    );
  });

  const event = new Event("numberoftabschangestart", { bubbles: true });
  this.tabList.dispatchEvent(event);
  this.tabs = remainingTabs;
}

export { deleteTabs };
