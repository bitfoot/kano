"use strict";

import { createTabObj } from "./util";

function addTab(browserTab) {
  const id = `tab-${browserTab.id}`;
  const index = browserTab.index;
  this.orderedTabObjects[index] = createTabObj.call(this, browserTab);
  if (this.orderedTabObjects[index].isPinned) {
    this.menu.lastPinnedTabIndex = index;
  }
  this.tabIndices[id] = [index, index];
}

// module.exports = addTab;
export { addTab };
