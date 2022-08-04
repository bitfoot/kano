"use strict";

const adjustMenu = require("./adjustMenu");
const adjustScrollbar = require("./util").adjustScrollbar;

function deleteTabs(idsOfTabsToDelete) {
  if (idsOfTabsToDelete.length === 0) return;
  const tabsToDelete = idsOfTabsToDelete.reduce((a, id) => {
    const index = this.tabIndices[id][0];
    const URL = this.orderedTabObjects[index].url;
    this.tabIdsByURL[URL] = this.tabIdsByURL[URL].filter(tabId => tabId !== id);
    if (this.tabIdsByURL[URL].length == 0) {
      delete this.tabIdsByURL[URL];
    }
    a[id] = this.tabs[index];
    return a;
  }, {});

  const reorderedTabObjects = [];
  let numDeleted = 0;
  let consecutiveDeletedTabs = 1;
  let lastDeletedTabVisibleIndex = null;
  this.orderedTabObjects.forEach((obj, i) => {
    if (!tabsToDelete[obj.id]) {
      if (this.tabIdsByURL[obj.url].length < 2) {
        obj.isDuplicate = false;
        this.tabs[i].classList.remove("tab--duplicate");
      }
      this.tabIndices[obj.id][0] = reorderedTabObjects.length;
      reorderedTabObjects[this.tabIndices[obj.id][0]] = obj;
      this.tabIndices[obj.id][1] -= numDeleted;
      const deletedOffset = numDeleted * -46 + "px";
      this.tabs[i].style.setProperty("--deleted-offset", deletedOffset);
    } else {
      numDeleted += 1;
      const visibleIndex = this.tabIndices[obj.id][1];
      if (visibleIndex - lastDeletedTabVisibleIndex === 1) {
        consecutiveDeletedTabs += 1;
      } else {
        consecutiveDeletedTabs = 1;
      }
      this.tabs[i].classList.add("tab--deleted");
      lastDeletedTabVisibleIndex = visibleIndex;
      delete this.tabIndices[obj.id];
    }
  });

  let animationDuration = 100;
  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = this.visibleTabIds.filter(id => !tabsToDelete[id]);
  const lastVisibleTabId = this.visibleTabIds[this.visibleTabIds.length - 1];
  if (lastVisibleTabId) {
    const lastVisibleTabIndex = this.tabIndices[lastVisibleTabId][1];
    if (lastVisibleTabIndex > lastDeletedTabVisibleIndex) {
      console.log(`consecutiveDeletedTabs: ${consecutiveDeletedTabs}`);
      animationDuration = Math.min(50 + consecutiveDeletedTabs * 50, 400);
    }
  }

  this.tabList.style.setProperty(
    "--below-deleted-animation-duration",
    animationDuration + "ms"
  );
  const timeoutDuration = 100 + animationDuration;

  setTimeout(() => {
    const browserTabIds = [];
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
      browserTabIds.push(parseInt(id.split("-")[1]));
    });
    this.tabs = this.tabs.filter(tab => !tabsToDelete[tab.id]);
    // this.visibleTabIds = this.visibleTabIds.filter(id => !tabsToDelete[id]);
    adjustMenu.call(this);
    adjustScrollbar.call(this);
    // chrome.tabs.remove(browserTabIds);
  }, timeoutDuration);
}

module.exports = deleteTabs;
