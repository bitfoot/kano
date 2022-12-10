"use strict";

const createTabComponent = require("./createTabComponent");

function renderTabComponents() {
  const fragment = document.createDocumentFragment();

  this.orderedTabObjects.forEach((obj, i) => {
    const tabComponent = createTabComponent.call(this, obj);
    fragment.appendChild(tabComponent);
    this.tabs[i] = tabComponent;
    this.visibleTabIds[i] = obj.id;
  });

  this.tabList.appendChild(fragment);
}

module.exports = renderTabComponents;
