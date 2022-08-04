"use strict";

function addTab(browserTab) {
  const id = `tab-${browserTab.id}`;
  let isDuplicate = null;

  // If entry doesn't already exist for this tab's URL, create a new entry
  if (this.tabIdsByURL[browserTab.url] == undefined) {
    this.tabIdsByURL[browserTab.url] = [id];
    isDuplicate = false;
  } else {
    // If entry already exists, it means tab is a duplicate.
    isDuplicate = true;
    // Add current tab ID to the URL entry.
    this.tabIdsByURL[browserTab.url].push(id);

    // The first tab with the same URL just became a duplicate, so it needs to be marked as such
    const duplicateTabId = this.tabIdsByURL[browserTab.url][0];
    const duplicateTabIndex = this.tabIndices[duplicateTabId][0];
    this.orderedTabObjects[duplicateTabIndex].isDuplicate = true;
  }

  const createTabObj = tab => {
    return {
      id,
      url: tab.url,
      title: tab.title,
      isActive: tab.active,
      isDuplicate,
      isChecked: false,
      favIconUrl: tab.favIconUrl,
      isVisible: true,
      isPinned: tab.pinned,
      lastAccessed: tab.lastAccessed
    };
  };

  this.orderedTabObjects[browserTab.index] = createTabObj(browserTab);
  this.tabIndices[id] = [browserTab.index, browserTab.index];
  this.numOfVisibleTabs += 1;
  // renderTabComponent.call(this, tab);
}

module.exports = addTab;
