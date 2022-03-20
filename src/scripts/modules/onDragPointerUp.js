"use strict";

function onDragPointerUp(event) {
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
  const draggedTabIndex = state.tabIndices[dragState.draggedTab.id];
  const midPoint = (dragState.tabHeight + dragState.margin) / 2;
  let isMoved = false;

  // if tab was dragged above where it was originally
  if (draggedTabTopPos < dragState.initialTabPos) {
    const replacedTab = dragState.tabsAbove.find(tab => {
      const halfTabHeight = dragState.tabHeight / 2;
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
      isMoved = true;
      const replacedTabIndex = state.tabIndices[replacedTab.id];
      // update tab indices
      state.tabIndices[dragState.draggedTab.id] = replacedTabIndex;
      console.log(`The new tab index is ${replacedTabIndex}`);
      dragState.tabsAbove.slice(replacedTabIndex).forEach(tab => {
        // tab.style.background = "red";
        state.tabIndices[tab.id] += 1;
        // const title = tab.querySelector(".tab__title");
        // title.innerText += ` INDEX: ${state.tabIndices[tab.id]}`;
      });

      let newTabOffset = 0;
      if (state.filterState.tabs[replacedTab.id]) {
        if (state.filterState.tabs[draggedTabId]) {
          newTabOffset = state.filterState.tabs[replacedTab.id].filterOffset;
          state.filterState.tabs[draggedTabId].filterOffset = newTabOffset;
        }
      }

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
      const halfTabHeight = dragState.tabHeight / 2;
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
      isMoved = true;
      const replacedTabIndex = state.tabIndices[replacedTab.id];
      state.tabIndices[dragState.draggedTab.id] = replacedTabIndex;
      dragState.tabsBelow
        .slice(0, replacedTabIndex - draggedTabIndex)
        .forEach(tab => {
          state.tabIndices[tab.id] -= 1;
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
    if (tab.id === draggedTabId) {
      if (isMoved) {
        return;
      } else {
        // tab.style.setProperty(
        //   "--y-offset",
        //   dragState.tabsPosInfo[tab.id].filterOffset + "px"
        // );
      }
    }
    let filterOffset = dragState.tabsPosInfo[tab.id].filterOffset;
    let dragOffset = dragState.tabsPosInfo[tab.id].dragOffset;

    if (dragOffset > 0) {
      if (dragOffset > midPoint) {
        dragOffset = dragState.tabHeight + dragState.margin;
      } else {
        dragOffset = 0;
      }
    } else {
      if (Math.abs(dragOffset) > midPoint) {
        dragOffset = (dragState.tabHeight + dragState.margin) * -1;
      } else {
        dragOffset = 0;
      }
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

  if (dragState.tabListOffset !== 0) {
    dragState.tabListContainer.scrollBy(0, dragState.tabListOffset);
    console.log(
      `Scrolling BY ${dragState.tabListOffset} from within onDragPointerUp`
    );
    dragState.tabListOffset = 0;
  }

  const tabButton = dragState.draggedTab.querySelector(".tab__tab-button");
  tabButton.focus();

  // tab order has changed, so it should be changed in the "tabs" and "orderedTabObjects" lists in state
  // this.tabs = [
  //   ...dragState.tabsAbove,
  //   dragState.draggedTab,
  //   ...dragState.tabsBelow
  // ];
  state.tabs = [...document.getElementsByClassName(`tab`)];
  const reorderedTabObjects = [];
  state.orderedTabObjects.forEach(tabObj => {
    const newIndex = state.tabIndices[tabObj.id];
    reorderedTabObjects[newIndex] = tabObj;
  });
  state.orderedTabObjects = reorderedTabObjects;
  this.dragState = null;
}

module.exports = onDragPointerUp;
