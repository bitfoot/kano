"use strict";

// const renderTabComponent = require("./renderTabComponent");
// const getNewDuplicateColor = require("./util").getNewDuplicateColor;

function addTab(tab) {
  const state = this;
  const id = `tab-${tab.id}`;
  let isDuplicate;

  // If entry doesn't already exist for this tab's URL, create a new entry
  if (state.tabIdsByURL[tab.url] == undefined) {
    state.tabIdsByURL[tab.url] = [id];
    isDuplicate = false;
  } else {
    // If entry already exists, it means tab is a duplicate.
    isDuplicate = true;
    // Add current tab ID to the URL entry.
    state.tabIdsByURL[tab.url].push(id);

    // The first tab with the same URL just became a duplicate, so it needs to be marked as such
    const duplicateTabId = state.tabIdsByURL[tab.url][0];
    const duplicateTabIndex = state.tabIndices[duplicateTabId];
    state.orderedTabObjects[duplicateTabIndex].isDuplicate = true;
  }

  const createTabObj = tab => {
    return {
      id,
      url: tab.url,
      title: tab.title,
      isActive: tab.active,
      isDuplicate,
      favIconUrl: tab.favIconUrl,
      visible: true
    };
  };

  state.orderedTabObjects[tab.index] = createTabObj(tab);
  state.tabIndices[id] = tab.index;

  // renderTabComponent.call(state, tab);
}

module.exports = addTab;
