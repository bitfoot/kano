"use strict";

// const renderTabComponent = require("./renderTabComponent");
// const getNewDuplicateColor = require("./util").getNewDuplicateColor;

function addTab(tab) {
  const id = `tab-${tab.id}`;
  let isDuplicate = null;

  // If entry doesn't already exist for this tab's URL, create a new entry
  if (this.tabIdsByURL[tab.url] == undefined) {
    this.tabIdsByURL[tab.url] = [id];
    isDuplicate = false;
  } else {
    // If entry already exists, it means tab is a duplicate.
    isDuplicate = true;
    // Add current tab ID to the URL entry.
    this.tabIdsByURL[tab.url].push(id);

    // The first tab with the same URL just became a duplicate, so it needs to be marked as such
    const duplicateTabId = this.tabIdsByURL[tab.url][0];
    const duplicateTabIndex = this.tabIndices[duplicateTabId];
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
      isVisible: true
    };
  };

  this.orderedTabObjects[tab.index] = createTabObj(tab);
  this.tabIndices[id] = tab.index;
  this.numOfVisibleTabs += 1;
  // renderTabComponent.call(this, tab);
}

module.exports = addTab;
