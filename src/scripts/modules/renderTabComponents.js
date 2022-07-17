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
    state.visibleTabObjects[i] = { id: obj.id, indexInTabs: i };
  });

  state.tabList.appendChild(fragment);
  // adjustBodyPadding.call(state);
}

// function adjustBodyPadding() {
//   const state = this;
//   // if html has a vertical scrollbar, padding-right should be adjusted on the body to avoid unsightly gap
//   if (state.tabList.scrollHeight > state.tabList.clientHeight) {
//     state.tabList.classList.add("tab-list--scroll");
//   } else {
//     state.tabList.classList.remove("tab-list--scroll");
//   }
// }

module.exports = renderTabComponents;
