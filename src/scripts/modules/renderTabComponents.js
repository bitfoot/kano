"use strict";

import { createTabComponent } from "./createTabComponent";

function renderTabComponents() {
  const fragment = document.createDocumentFragment();

  this.orderedTabObjects.forEach((obj, i) => {
    const tabComponent = createTabComponent.call(this, obj);
    fragment.appendChild(tabComponent);
    this.tabs[i] = tabComponent;
    this.visibleTabIds[i] = obj.id;
  });

  this.tabList.appendChild(fragment);
  const event = new Event("numberoftabschange", { bubbles: true });
  this.tabList.dispatchEvent(event);
}

export { renderTabComponents };
