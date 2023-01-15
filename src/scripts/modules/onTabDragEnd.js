"use strict";

function onTabDragEnd() {
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
  const draggedTabIdInBrowser = +draggedTabId.split("-")[1];
  const initialDraggedTabIndex = state.tabIndices[draggedTabId][0];
  const draggedTabInitialVisibleIndex = state.tabIndices[draggedTabId][1];
  let replacedTabVisibleIndex = null;
  let draggedTabNewOffset = 0;
  let dragDirection = null;
  if (draggedTabTopPos > dragState.initialTabPos) {
    dragDirection = "down";
  } else if (draggedTabTopPos < dragState.initialTabPos) {
    dragDirection = "up";
  }

  // if tab was dragged above where it was originally
  if (dragDirection === "up") {
    const currentPos = dragState.tabPosInList;
    let newVisibleIndex;
    let positionAbove;
    let visibleIndexAbove;
    let distanceToPositionAbove;

    visibleIndexAbove = Math.floor(currentPos / dragState.tabRowHeight);
    positionAbove = visibleIndexAbove * dragState.tabRowHeight;
    distanceToPositionAbove = currentPos - positionAbove;
    if (distanceToPositionAbove < dragState.midPoint) {
      newVisibleIndex = visibleIndexAbove;
      draggedTabNewOffset = distanceToPositionAbove;
    } else {
      newVisibleIndex = visibleIndexAbove + 1;
      draggedTabNewOffset =
        (dragState.tabRowHeight - distanceToPositionAbove) * -1;
    }

    replacedTabVisibleIndex = newVisibleIndex;
    const replacedTabId = state.visibleTabIds[newVisibleIndex];
    const replacedTabIndex = state.tabIndices[replacedTabId][0];
    const replacedTab = state.tabs[replacedTabIndex];

    // update tab indices
    state.tabIndices[draggedTabId][0] = replacedTabIndex;
    state.orderedTabObjects
      .slice(replacedTabIndex, initialDraggedTabIndex)
      .forEach(obj => {
        state.tabIndices[obj.id][0] += 1;
      });

    let newFilterOffset = 0;
    if (state.filterState.tabs[replacedTabId]) {
      if (state.filterState.tabs[draggedTabId]) {
        newFilterOffset = state.filterState.tabs[replacedTabId].filterOffset;
        state.filterState.tabs[draggedTabId].filterOffset = newFilterOffset;
      }
    }
    dragState.tabList.insertBefore(dragState.draggedTab, replacedTab);

    // move the actual chrome tab
    const replacedTabIdInBrowser = +replacedTab.id.split("-")[1];
    chrome.tabs.get(replacedTabIdInBrowser).then(tabDetails => {
      chrome.tabs.move(draggedTabIdInBrowser, { index: tabDetails.index });
    });
  } else if (dragDirection === "down") {
    // if tab was dragged below where it was originally.
    const currentPos = dragState.tabPosInList;
    let newVisibleIndex;
    let positionBelow;
    let visibleIndexBelow;
    let distanceToPositionBelow;

    visibleIndexBelow = Math.ceil(currentPos / dragState.tabRowHeight);
    positionBelow = visibleIndexBelow * dragState.tabRowHeight;
    distanceToPositionBelow = positionBelow - currentPos;

    if (distanceToPositionBelow < dragState.midPoint) {
      newVisibleIndex = visibleIndexBelow;
      draggedTabNewOffset = distanceToPositionBelow * -1;
    } else {
      newVisibleIndex = visibleIndexBelow - 1;
      draggedTabNewOffset = dragState.tabRowHeight - distanceToPositionBelow;
    }

    replacedTabVisibleIndex = newVisibleIndex;
    const replacedTabId = state.visibleTabIds[newVisibleIndex];
    const replacedTabIndex = state.tabIndices[replacedTabId][0];
    const replacedTab = state.tabs[replacedTabIndex];

    // update tab indices
    state.tabIndices[draggedTabId][0] = replacedTabIndex;
    state.orderedTabObjects
      .slice(initialDraggedTabIndex + 1, replacedTabIndex + 1)
      .forEach(obj => {
        state.tabIndices[obj.id][0] -= 1;
      });

    let newFilterOffset = 0;
    if (state.filterState.tabs[replacedTabId]) {
      if (state.filterState.tabs[draggedTabId]) {
        newFilterOffset = state.filterState.tabs[replacedTabId].filterOffset;
        state.filterState.tabs[draggedTabId].filterOffset = newFilterOffset;
      }
    }
    dragState.tabList.insertBefore(
      dragState.draggedTab,
      replacedTab.nextSibling
    );

    const replacedTabIdInBrowser = +replacedTab.id.split("-")[1];
    chrome.tabs.get(replacedTabIdInBrowser).then(tabDetails => {
      chrome.tabs.move(draggedTabIdInBrowser, { index: tabDetails.index });
    });
  }

  const onAnimationEnd = e => {
    if (e.animationName === "returnToNormal") {
      dragState.draggedTab.onanimationend = null;
      dragState.draggedTab.onanimationcancel = null;
      dragState.listedTabs.forEach(tab => {
        window.requestAnimationFrame(() => {
          tab.style.setProperty("--misc-offset", 0 + "px");
          if (tab.id === draggedTabId) {
            tab.style.setProperty("--backdrop-filter", "none");
            tab.style.setProperty("--special-z-index", 0);
          }
        });
      });
    }
  };

  dragState.draggedTab.onpointermove = null;
  dragState.draggedTab.onpointerup = null;
  dragState.draggedTab.onkeydown = null;
  dragState.draggedTab.onkeyup = null;
  dragState.draggedTab.firstChild.onblur = null;
  dragState.draggedTab.onanimationend = onAnimationEnd;
  dragState.draggedTab.onanimationcancel = onAnimationEnd;

  window.requestAnimationFrame(() => {
    dragState.tabList.style.setProperty("--y-offset", 0 + "px");
    dragState.tabList.classList.remove("tab-list--scroll");
    dragState.draggedTab.style.setProperty("--special-z-index", 10);
    dragState.draggedTab.style.setProperty("--backdrop-filter", "blur(6px)");
    dragState.draggedTab.classList.remove("tab--draggable");
  });

  // reset style values of all the tabs to their defaults
  dragState.listedTabs.forEach(tab => {
    let filterOffset = 0;
    if (state.filterState.tabs[tab.id]) {
      filterOffset = state.filterState.tabs[tab.id].filterOffset;
    }

    let posDifference = 0;

    if (tab.id === draggedTabId) {
      posDifference = draggedTabNewOffset;
    } else {
      const initialPos = dragState.tabsPosInfo[tab.id].initialPos;
      const dragOffset = dragState.tabsPosInfo[tab.id].dragOffset;
      const currentPos = initialPos + dragOffset;
      let newPos;
      if (dragOffset > dragState.midPoint) {
        newPos = initialPos + dragState.tabRowHeight;
      } else if (dragOffset < dragState.midPoint * -1) {
        newPos = initialPos - dragState.tabRowHeight;
      } else newPos = initialPos;
      posDifference = currentPos - newPos;
    }

    requestAnimationFrame(() => {
      tab.style.setProperty("--filter-offset", filterOffset + "px");
      tab.style.setProperty("--drag-offset", 0 + "px");
      // tab.style.setProperty("--opacity", 1);
      tab.style.setProperty("--misc-offset", posDifference + "px");
      tab.classList.remove("tab--tethered");
      tab.classList.remove("tab--floating");
    });
  });

  if (this.scrollState.tabListOffset !== 0) {
    dragState.tabListContainer.scrollBy(0, this.scrollState.tabListOffset);
  }

  // tab order has changed, so it should be changed in the "tabs" and "orderedTabObjects" lists in state
  if (dragDirection !== null) {
    state.tabs = [...document.getElementsByClassName(`tab`)];
    const reorderedTabObjects = [];
    state.orderedTabObjects.forEach(tabObj => {
      const newIndex = state.tabIndices[tabObj.id][0];
      reorderedTabObjects[newIndex] = tabObj;
    });
    state.orderedTabObjects = reorderedTabObjects;

    // reorder visibleTabIds
    const visibleIndexDifference =
      replacedTabVisibleIndex - draggedTabInitialVisibleIndex;

    const sign = visibleIndexDifference / Math.abs(visibleIndexDifference);
    for (let i = 1; i <= visibleIndexDifference * sign; i++) {
      const displacedIdIndex = draggedTabInitialVisibleIndex + i * sign;
      const adjacentIndex = displacedIdIndex - 1 * sign;
      const displacedId = state.visibleTabIds[displacedIdIndex];
      state.visibleTabIds[adjacentIndex] = displacedId;
      state.tabIndices[displacedId][1] = adjacentIndex;
    }
    state.visibleTabIds[replacedTabVisibleIndex] = draggedTabId;
    state.tabIndices[draggedTabId][1] = replacedTabVisibleIndex;
  }

  const event = new Event("orderoftabschange", { bubbles: true });
  this.tabList.dispatchEvent(event);
  this.dragState = null;
}

export { onTabDragEnd };
