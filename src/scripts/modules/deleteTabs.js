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
  let consecutiveDeletedTabs = 0;
  let mostConsecutiveDeletedTabs = 0;
  let mostConsecutiveDeletedTabsBeforeVisibleTab = 0;
  let lastDeletedTabVisibleIndex = null;

  this.orderedTabObjects.forEach((obj, i) => {
    const tab = this.tabs[i];
    if (!tabsToDelete[obj.id]) {
      if (this.tabIdsByURL[obj.url].length < 2) {
        obj.isDuplicate = false;
        window.requestAnimationFrame(() => {
          tab.classList.remove("tab--duplicate");
        });
      }
      // if tab is not hidden, save its visible index to a variable and update that index
      if (this.tabIndices[obj.id][1] !== null) {
        mostConsecutiveDeletedTabsBeforeVisibleTab = mostConsecutiveDeletedTabs;
        this.tabIndices[obj.id][1] -= numDeleted;
      }
      // update tab's browser index
      this.tabIndices[obj.id][0] = reorderedTabObjects.length;
      reorderedTabObjects[this.tabIndices[obj.id][0]] = obj;
      const deletedOffset = numDeleted * -46 + "px";
      window.requestAnimationFrame(() => {
        tab.style.setProperty("--deleted-offset", deletedOffset);
      });
    } else {
      numDeleted += 1;
      const visibleIndex = this.tabIndices[obj.id][1];
      if (
        visibleIndex - lastDeletedTabVisibleIndex === 1 ||
        lastDeletedTabVisibleIndex === null
      ) {
        consecutiveDeletedTabs += 1;
        if (consecutiveDeletedTabs > mostConsecutiveDeletedTabs) {
          mostConsecutiveDeletedTabs = consecutiveDeletedTabs;
        }
      } else {
        consecutiveDeletedTabs = 1;
      }
      window.requestAnimationFrame(() => {
        tab.classList.add("tab--deleted");
      });

      lastDeletedTabVisibleIndex = visibleIndex;
      delete this.tabIndices[obj.id];
    }
  });

  let animationDuration = 100;
  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = this.visibleTabIds.filter(id => !tabsToDelete[id]);

  animationDuration = Math.min(
    60 + Math.max(1, mostConsecutiveDeletedTabsBeforeVisibleTab) * 40,
    380
  );

  const timeoutDuration = 100 + animationDuration;
  window.requestAnimationFrame(() => {
    document.documentElement.style.setProperty(
      "--below-deleted-animation-duration",
      animationDuration + "ms"
    );
  });
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
  }, timeoutDuration);
}

module.exports = deleteTabs;
