"use strict";

// const util = require("./util");
const createTabComponent = require("./createTabComponent");

function renderTabComponents() {
  const state = this;
  const fragment = document.createDocumentFragment();

  // orderedTabObjects items should be in the same order as actual tabs on screen
  // that means when tab is dragged or moved, you need to loop through tabIndices object, get updated indices for each tab id, and then reorder orderedTabObjects objects.
  state.orderedTabObjects.forEach(tab => {
    const tabComponent = createTabComponent.call(state, tab);
    fragment.appendChild(tabComponent);
    state.tabs.push(tabComponent);
  });

  state.tabList.appendChild(fragment);
  adjustBodyPadding.call(state);
}

function adjustBodyPadding() {
  const state = this;
  // if html has a vertical scrollbar, padding-right should be adjusted on the body to avoid unsightly gap
  if (state.tabList.scrollHeight > state.tabList.clientHeight) {
    state.tabList.classList.add("tab-list--scroll");
  } else {
    state.tabList.classList.remove("tab-list--scroll");
  }
}

module.exports = renderTabComponents;
