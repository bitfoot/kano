"use strict";

import { createTabObj } from "./util";

function addTab(browserTab) {
  const id = `tab-${browserTab.id}`;
  const index = browserTab.index;
  this.orderedTabObjects[index] = createTabObj.call(this, browserTab);
  if (this.orderedTabObjects[index].isPinned) {
    this.menu.lastPinnedTabIndex = index;
  } else if (this.menu.firstUnpinnedTabIndex === null) {
    this.menu.firstUnpinnedTabIndex = index;
  }
  this.tabIndices[id] = [index, index];
}

export { addTab };
