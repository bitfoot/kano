"use strict";

// const util = require("./util");
const createTabComponent = require("./createTabComponent");

function renderTabComponents() {
  const state = this;
  const fragment = document.createDocumentFragment();

  state.orderedTabObjects.forEach((obj, i) => {
    const tabComponent = createTabComponent.call(state, obj);
    fragment.appendChild(tabComponent);
    state.tabs[i] = tabComponent;
    state.visibleTabIds[i] = obj.id;
  });

  state.tabList.appendChild(fragment);
}

module.exports = renderTabComponents;
