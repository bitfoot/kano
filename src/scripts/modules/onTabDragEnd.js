"use strict";

const adjustMenu = require("./adjustMenu");

function onTabDragPointerUp(event) {
  const state = this;
  const dragState = state.dragState;
  if (dragState.animation) {
    console.log(`cancelled animation from within onDragPointerUp`);
    cancelAnimationFrame(dragState.animation);
    dragState.animation = null;
  }

  window.requestAnimationFrame(() => {
    dragState.tabListContainer.classList.remove(
      "tab-list-container--no-scroll"
    );
  });

  const draggedTabId = state.dragState.draggedTab.id;
  const draggedTabTopPos = dragState.tabPosInList;
  // const draggedTabInitialPos = dragState.initialTabPos;
  const draggedTabIdInBrowser = +draggedTabId.split("-")[1];
  const draggedTabIndex = state.tabIndices[draggedTabId][0];
  const halfTabHeight = dragState.tabHeight / 2;
  // let isMoved = false;
  let movedDirection = null;
  const draggedTabVisibleIndex = state.tabIndices[draggedTabId][1];
  let replacedTabVisibleIndex = null;
  let replacedTabId = null;
  let replacedTabTitle = null;

  // if tab was dragged above where it was originally
  if (draggedTabTopPos < dragState.initialTabPos) {
    const replacedTab = dragState.tabsAbove.find(tab => {
      const tabOffsetMiddle =
        dragState.tabsPosInfo[tab.id].initialPos + halfTabHeight;
      let isFilteredOut = false;
      if (state.filterState.tabs[tab.id]) {
        isFilteredOut = state.filterState.tabs[tab.id].isFilteredOut;
      }
      if (
        !isFilteredOut &&
        tabOffsetMiddle > draggedTabTopPos &&
        dragState.tabsPosInfo[tab.id].initialPos -
        dragState.margin -
        halfTabHeight <
        draggedTabTopPos
      ) {
        return tab;
      }
    });

    if (replacedTab) {
      // replacedTabTitle = replacedTab.querySelector(".tab__title").innerText;
      replacedTabId = replacedTab.id;
      // isMoved = true;
      movedDirection = "up";
      const replacedTabIndex = state.tabIndices[replacedTab.id][0];
      replacedTabVisibleIndex = state.tabIndices[replacedTab.id][1];
      // update tab indices
      state.tabIndices[draggedTabId][0] = replacedTabIndex;
      dragState.tabsAbove.slice(replacedTabIndex).forEach(tab => {
        state.tabIndices[tab.id][0] += 1;
      });

      let newFilterOffset = 0;
      if (state.filterState.tabs[replacedTab.id]) {
        if (state.filterState.tabs[draggedTabId]) {
          newFilterOffset = state.filterState.tabs[replacedTab.id].filterOffset;
          state.filterState.tabs[draggedTabId].filterOffset = newFilterOffset;
          // dragState.tabsPosInfo[draggedTabId].filterOffset = newFilterOffset;
        }
      }
      dragState.tabList.insertBefore(dragState.draggedTab, replacedTab);
      // requestAnimationFrame(() => {
      //   // dragState.tabList.insertBefore(dragState.draggedTab, replacedTab);
      //   dragState.draggedTab.style.setProperty(
      //     "--y-offset",
      //     newFilterOffset + "px"
      //   );
      // });

      // move the actual chrome tab
      const replacedTabIdInBrowser = +replacedTab.id.split("-")[1];
      chrome.tabs.get(replacedTabIdInBrowser).then(tabDetails => {
        chrome.tabs.move(draggedTabIdInBrowser, { index: tabDetails.index });
      });
    }
  } else {
    // if tab was dragged below where it was originally.
    const replacedTab = dragState.tabsBelow.find(tab => {
      const tabOffsetMiddle =
        dragState.tabsPosInfo[tab.id].initialPos + halfTabHeight;
      const draggedTabBottom = draggedTabTopPos + dragState.tabHeight;
      let isFilteredOut = false;
      if (state.filterState.tabs[tab.id]) {
        isFilteredOut = state.filterState.tabs[tab.id].isFilteredOut;
      }
      if (
        !isFilteredOut &&
        tabOffsetMiddle < draggedTabBottom &&
        dragState.tabsPosInfo[tab.id].initialPos +
        dragState.tabHeight +
        dragState.margin +
        halfTabHeight >
        draggedTabBottom
      ) {
        return tab;
      }
    });

    if (replacedTab) {
      // replacedTabTitle = replacedTab.querySelector(".tab__title").innerText;
      replacedTabId = replacedTab.id;
      // isMoved = true;
      movedDirection = "down";
      const replacedTabIndex = state.tabIndices[replacedTab.id][0];
      replacedTabVisibleIndex = state.tabIndices[replacedTab.id][1];
      state.tabIndices[draggedTabId][0] = replacedTabIndex;
      dragState.tabsBelow
        .slice(0, replacedTabIndex - draggedTabIndex)
        .forEach(tab => {
          state.tabIndices[tab.id][0] -= 1;
        });

      let newFilterOffset = 0;
      if (state.filterState.tabs[replacedTab.id]) {
        if (state.filterState.tabs[draggedTabId]) {
          newFilterOffset = state.filterState.tabs[replacedTab.id].filterOffset;
          state.filterState.tabs[draggedTabId].filterOffset = newFilterOffset;
          // dragState.tabsPosInfo[draggedTabId].filterOffset = newFilterOffset;
        }
      }
      dragState.tabList.insertBefore(
        dragState.draggedTab,
        replacedTab.nextSibling
      );
      // requestAnimationFrame(() => {
      //   dragState.draggedTab.style.setProperty(
      //     "--y-offset",
      //     newFilterOffset + "px"
      //   );
      // });

      const replacedTabIdInBrowser = +replacedTab.id.split("-")[1];
      chrome.tabs.get(replacedTabIdInBrowser).then(tabDetails => {
        chrome.tabs.move(draggedTabIdInBrowser, { index: tabDetails.index });
      });
    }
  }

  dragState.draggedTab.onpointermove = null;
  dragState.draggedTab.onpointerup = null;
  dragState.draggedTab.onkeydown = null;
  dragState.draggedTab.onkeyup = null;
  dragState.draggedTab.firstChild.onblur = null;
  window.requestAnimationFrame(() => {
    dragState.tabList.style.setProperty("--y-offset", 0 + "px");
    dragState.tabList.classList.remove("tab-list--scroll");
    dragState.draggedTab.classList.remove("tab--draggable");
  });

  // reset style values of all the tabs to their defaults
  dragState.listedTabs.forEach(tab => {
    // let filterOffset = dragState.tabsPosInfo[tab.id].filterOffset;
    let filterOffset = 0;
    if (state.filterState.tabs[tab.id]) {
      filterOffset = state.filterState.tabs[tab.id].filterOffset;
    }

    requestAnimationFrame(() => {
      tab.style.setProperty("--y-offset", filterOffset + "px");
      tab.style.setProperty("--opacity", 1);
      tab.style.setProperty("--scale", 1);
      tab.classList.remove("tab--floating");
    });
  });

  if (this.scrollState.tabListOffset !== 0) {
    dragState.tabListContainer.scrollBy(0, this.scrollState.tabListOffset);
  }

  // const tabButton = dragState.draggedTab.firstChild;
  // tabButton.focus();

  // tab order has changed, so it should be changed in the "tabs" and "orderedTabObjects" lists in state
  if (movedDirection !== null) {
    state.tabs = [...document.getElementsByClassName(`tab`)];
    const reorderedTabObjects = [];
    state.orderedTabObjects.forEach(tabObj => {
      const newIndex = state.tabIndices[tabObj.id][0];
      reorderedTabObjects[newIndex] = tabObj;
    });
    state.orderedTabObjects = reorderedTabObjects;

    // reorder visibleTabIds
    const visibleIndexDifference =
      replacedTabVisibleIndex - draggedTabVisibleIndex;

    const sign = visibleIndexDifference / Math.abs(visibleIndexDifference);
    for (let i = 1; i <= visibleIndexDifference * sign; i++) {
      const displacedIdIndex = draggedTabVisibleIndex + i * sign;
      const adjacentIndex = displacedIdIndex - 1 * sign;
      const displacedId = state.visibleTabIds[displacedIdIndex];
      state.visibleTabIds[adjacentIndex] = displacedId;
      state.tabIndices[displacedId][1] = adjacentIndex;
    }
    state.visibleTabIds[replacedTabVisibleIndex] = draggedTabId;
    state.tabIndices[draggedTabId][1] = replacedTabVisibleIndex;
    adjustMenu.call(state);
  }

  this.dragState = null;
}

module.exports = onTabDragPointerUp;
