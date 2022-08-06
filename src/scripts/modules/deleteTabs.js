"use strict";

const adjustMenu = require("./adjustMenu");
const adjustScrollbar = require("./util").adjustScrollbar;

function deleteTabs(idsOfTabsToDelete) {
  if (idsOfTabsToDelete.length === 0) return;
  const tabsToDelete = idsOfTabsToDelete.reduce((a, id) => {
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
  let consecutiveDeletedTabs = 1;
  let mostConsecutiveDeletedTabs = consecutiveDeletedTabs;
  let firstDeletedTabVisibleIndex = null;
  let lastDeletedTabVisibleIndex = null;
  let lastVisibleTabIndex = null;

  this.orderedTabObjects.forEach((obj, i) => {
    if (!tabsToDelete[obj.id]) {
      if (this.tabIdsByURL[obj.url].length < 2) {
        obj.isDuplicate = false;
        this.tabs[i].classList.remove("tab--duplicate");
      }
      // if tab is not hidden, save its visible index to a variable and update that index
      if (this.tabIndices[obj.id][1] !== null) {
        lastVisibleTabIndex = this.tabIndices[obj.id][1];
        this.tabIndices[obj.id][1] -= numDeleted;
      }
      // update tab's browser index
      this.tabIndices[obj.id][0] = reorderedTabObjects.length;
      reorderedTabObjects[this.tabIndices[obj.id][0]] = obj;
      const deletedOffset = numDeleted * -46 + "px";
      this.tabs[i].style.setProperty("--deleted-offset", deletedOffset);
    } else {
      numDeleted += 1;
      const visibleIndex = this.tabIndices[obj.id][1];
      if (firstDeletedTabVisibleIndex === null) {
        firstDeletedTabVisibleIndex = visibleIndex;
      }
      if (visibleIndex - lastDeletedTabVisibleIndex === 1) {
        consecutiveDeletedTabs += 1;
        if (consecutiveDeletedTabs > mostConsecutiveDeletedTabs) {
          mostConsecutiveDeletedTabs = consecutiveDeletedTabs;
        }
      } else {
        consecutiveDeletedTabs = 1;
      }
      this.tabs[i].classList.add("tab--deleted");
      lastDeletedTabVisibleIndex = visibleIndex;
      delete this.tabIndices[obj.id];
    }
  });
  // console.log(`consecutiveDeletedTabs: ${consecutiveDeletedTabs}`);
  let animationDuration = 100;
  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = this.visibleTabIds.filter(id => !tabsToDelete[id]);
  if (
    lastVisibleTabIndex !== null &&
    lastVisibleTabIndex > firstDeletedTabVisibleIndex
  ) {
    animationDuration = Math.min(50 + mostConsecutiveDeletedTabs * 50, 400);
  }

  console.log(
    `mostConsecutiveDeletedTabs: ${mostConsecutiveDeletedTabs}, animationDuration: ${animationDuration}`
  );

  const timeoutDuration = 100 + animationDuration;
  this.tabList.style.setProperty(
    "--below-deleted-animation-duration",
    animationDuration + "ms"
  );
  this.tabs = this.tabs.filter(tab => !tabsToDelete[tab.id]);
  adjustMenu.call(this);
  adjustScrollbar.call(this);
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
    // this.tabs = this.tabs.filter(tab => !tabsToDelete[tab.id]);
    // this.visibleTabIds = this.visibleTabIds.filter(id => !tabsToDelete[id]);
    // adjustMenu.call(this);
    // adjustScrollbar.call(this);
    // chrome.tabs.remove(browserTabIds);
  }, timeoutDuration);
}

module.exports = deleteTabs;
