"use strict";

const adjustMenu = require("./adjustMenu");

function onTabDragPointerUp(event) {
  const state = this;
  const dragState = this.dragState;
  if (dragState.animation) {
    console.log(`cancelled animation from within onDragPointerUp`);
    cancelAnimationFrame(dragState.animation);
    dragState.animation = null;
  }

  dragState.tabListContainer.classList.remove("tab-list-container--no-scroll");

  const draggedTabId = state.dragState.draggedTab.id;
  const draggedTabTopPos = dragState.tabPosInList;
  const draggedTabInitialPos = dragState.initialTabPos;
  const draggedTabIdInBrowser = +dragState.draggedTab.id.split("-")[1];
  const draggedTabIndex = state.tabIndices[draggedTabId][0];
  const midPoint = (dragState.tabHeight + dragState.margin) / 2;
  const halfTabHeight = dragState.tabHeight / 2;
  // let isMoved = false;
  let movedDirection = null;
  const draggedTabVisibleIndex = draggedTabInitialPos / 46;
  console.log(`draggedTabVisibleIndex is ${draggedTabVisibleIndex}`);
  let replacedTabVisibleIndex = null;

  // if tab was dragged above where it was originally
  if (draggedTabTopPos < dragState.initialTabPos) {
    const replacedTab = dragState.tabsAbove.find(tab => {
      const tabOffsetMiddle =
        dragState.tabsPosInfo[tab.id].initialPos + halfTabHeight;
      let isFilteredOut = false;
      if (state.filterState.tabs[tab.id]) {
        if (state.filterState.tabs[tab.id].isFilteredOut) {
          isFilteredOut = true;
        }
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
      // isMoved = true;
      movedDirection = "up";
      const replacedTabIndex = state.tabIndices[replacedTab.id][0];
      replacedTabVisibleIndex =
        dragState.tabsPosInfo[replacedTab.id].initialPos / 46;
      // update tab indices
      state.tabIndices[draggedTabId][0] = replacedTabIndex;
      dragState.tabsAbove.slice(replacedTabIndex).forEach(tab => {
        state.tabIndices[tab.id][0] += 1;
      });

      let newTabOffset = 0;
      if (state.filterState.tabs[replacedTab.id]) {
        if (state.filterState.tabs[draggedTabId]) {
          newTabOffset = state.filterState.tabs[replacedTab.id].filterOffset;
          state.filterState.tabs[draggedTabId].filterOffset = newTabOffset;
        }
      }

      console.log(`Tab was moved above. The new tab offset is ${newTabOffset}`);
      console.log(replacedTab);

      dragState.tabList.insertBefore(dragState.draggedTab, replacedTab);
      dragState.draggedTab.style.setProperty("--y-offset", newTabOffset + "px");

      // move the actual chrome tab
      const replacedTabId = +replacedTab.id.split("-")[1];
      chrome.tabs.get(replacedTabId).then(tabDetails => {
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
        if (state.filterState.tabs[tab.id].isFilteredOut) {
          isFilteredOut = true;
        }
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
      // isMoved = true;
      movedDirection = "up";
      const replacedTabIndex = state.tabIndices[replacedTab.id][0];
      replacedTabVisibleIndex =
        dragState.tabsPosInfo[replacedTab.id].initialPos / 46;
      state.tabIndices[draggedTabId][0] = replacedTabIndex;
      dragState.tabsBelow
        .slice(0, replacedTabIndex - draggedTabIndex)
        .forEach(tab => {
          state.tabIndices[tab.id][0] -= 1;
        });

      let newTabOffset = 0;
      if (state.filterState.tabs[replacedTab.id]) {
        if (state.filterState.tabs[draggedTabId]) {
          newTabOffset = state.filterState.tabs[replacedTab.id].filterOffset;
          state.filterState.tabs[draggedTabId].filterOffset = newTabOffset;
        }
      }
      dragState.tabList.insertBefore(
        dragState.draggedTab,
        replacedTab.nextSibling
      );
      dragState.draggedTab.style.setProperty("--y-offset", newTabOffset + "px");

      const replacedTabId = +replacedTab.id.split("-")[1];
      chrome.tabs.get(replacedTabId).then(tabDetails => {
        chrome.tabs.move(draggedTabIdInBrowser, { index: tabDetails.index });
      });
    }
  }

  dragState.tabList.style.setProperty("--y-offset", 0 + "px");
  dragState.tabList.classList.remove("tab-list--scroll");
  dragState.draggedTab.onpointermove = null;
  dragState.draggedTab.onpointerup = null;
  dragState.draggedTab.classList.remove("tab--draggable");

  // reset style values of all the tabs to their defaults
  dragState.listedTabs.forEach(tab => {
    if (tab.id === draggedTabId && movedDirection !== null) {
      return;
    }
    let filterOffset = dragState.tabsPosInfo[tab.id].filterOffset;
    let dragOffset = dragState.tabsPosInfo[tab.id].dragOffset;

    if (movedDirection !== null) {
      if (dragOffset !== 0) {
        if (dragOffset > midPoint) {
          dragOffset = dragState.tabHeight + dragState.margin;
        } else {
          dragOffset = (dragState.tabHeight + dragState.margin) * -1;
        }
      }
    } else {
      dragOffset = 0;
    }

    let newOffset = filterOffset + dragOffset;
    if (state.filterState.tabs[tab.id]) {
      state.filterState.tabs[tab.id].filterOffset = newOffset;
    }
    tab.style.setProperty("--y-offset", newOffset + "px");
    tab.style.setProperty("--opacity", 1);
    tab.style.setProperty("--scale", 0.99);
    tab.classList.remove("tab--moving", "tab--moveable");
  });

  if (this.scrollState.tabListOffset !== 0) {
    dragState.tabListContainer.scrollBy(0, this.scrollState.tabListOffset);
    console.log(
      `Scrolling BY ${dragState.tabListOffset} from within onDragPointerUp`
    );
    // dragState.tabListOffset = 0;
  }

  const tabButton = dragState.draggedTab.querySelector(".tab__tab-button");
  tabButton.focus();

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
