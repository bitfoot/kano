"use strict";

// const getFaviconUrl = require("./util").getFaviconUrl;
import { getFaviconUrl } from "./util";

function addTab(browserTab) {
  const id = `tab-${browserTab.id}`;
  let isDuplicate;

  // If entry doesn't already exist for this tab's URL, create a new entry
  if (this.tabIdsByURL[browserTab.url] === undefined) {
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
    let faviconUrl = tab.favIconUrl;
    let url = tab.url;
    if (!faviconUrl) {
      faviconUrl = getFaviconUrl(url) || "images/default20.png";
    }
    return {
      id,
      url,
      title: tab.title,
      isActive: tab.active,
      isDuplicate,
      isChecked: false,
      favIconUrl: faviconUrl,
      isVisible: true,
      isPinned: tab.pinned,
      lastAccessed: tab.lastAccessed
    };
  };

  const index = browserTab.index;
  this.orderedTabObjects[index] = createTabObj(browserTab);
  this.tabIndices[id] = [index, index];
}

// module.exports = addTab;
export { addTab };
