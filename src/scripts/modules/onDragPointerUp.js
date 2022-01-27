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

  const draggedTabTopPos = dragState.tabPosInList;
  const draggedTabIdInBrowser = +dragState.draggedTab.id.split("-")[1];
  const draggedTabIndex = state.tabIndices[dragState.draggedTab.id];
  // const oldTabIndex = dragState.draggedTab.

  dragState.tabList.style.setProperty("--y-offset", 0 + "px");
  dragState.tabList.classList.remove("tab-list--scroll");

  dragState.draggedTab.onpointermove = null;
  dragState.draggedTab.onpointerup = null;

  dragState.draggedTab.classList.remove("tab--draggable");
  // reset style values of all the tabs to their defaults
  dragState.listedTabs.forEach(tab => {
    tab.style.setProperty("--y-offset", 0);
    tab.style.setProperty("--opacity", 1);
    tab.style.setProperty("--scale", 0.99);
    tab.classList.remove("tab--moving", "tab--moveable");
  });

  // if tab was dragged above where it was originally
  if (draggedTabTopPos < dragState.initialPosition) {
    const nextTab = dragState.tabsAbove.find(tab => {
      const halfTabHeight = dragState.tabHeight / 2;
      const tabOffsetMiddle = dragState.offsetTops[tab.id] + halfTabHeight;
      if (
        tabOffsetMiddle > draggedTabTopPos &&
        dragState.offsetTops[tab.id] - dragState.margin - halfTabHeight <
        draggedTabTopPos
      ) {
        return tab;
      }
    });

    if (nextTab) {
      const nextTabIndex = state.tabIndices[nextTab.id];

      // update tab indices
      state.tabIndices[dragState.draggedTab.id] = nextTabIndex;
      console.log(`The new tab index is ${nextTabIndex}`);
      dragState.tabsAbove.slice(nextTabIndex).forEach(tab => {
        // tab.style.background = "red";
        state.tabIndices[tab.id] += 1;
        // const title = tab.querySelector(".tab__title");
        // title.innerText += ` INDEX: ${state.tabIndices[tab.id]}`;
      });

      dragState.tabList.insertBefore(dragState.draggedTab, nextTab);

      // move the actual chrome tab
      const nextTabId = +nextTab.id.split("-")[1];
      chrome.tabs.get(nextTabId).then(tabDetails => {
        // console.log(tabDetails);
        chrome.tabs.move(draggedTabIdInBrowser, { index: tabDetails.index });
      });
    }
  } else {
    // if tab was dragged below where it was originally.
    const nextTab = dragState.tabsBelow.find(tab => {
      if (
        dragState.offsetTops[tab.id] + 20 <
        draggedTabTopPos + dragState.tabHeight &&
        dragState.offsetTops[tab.id] +
        dragState.tabHeight +
        dragState.margin +
        20 >
        draggedTabTopPos + dragState.tabHeight
      ) {
        return tab;
      }
    });

    if (nextTab) {
      console.log(
        `Next tab is ${nextTab.querySelector(".tab__title").innerText}`
      );

      const draggedTabIndex = state.tabIndices[dragState.draggedTab.id];
      const nextTabIndex = state.tabIndices[nextTab.id];
      // update tab indices
      state.tabIndices[dragState.draggedTab.id] = nextTabIndex;
      console.log(`The new tab index is ${nextTabIndex}`);
      dragState.tabsBelow
        .slice(0, nextTabIndex - draggedTabIndex)
        .forEach(tab => {
          // tab.style.background = "purple";
          state.tabIndices[tab.id] -= 1;
          // const title = tab.querySelector(".tab__title");
          // title.innerText += ` INDEX: ${state.tabIndices[tab.id]}`;
        });

      dragState.tabList.insertBefore(dragState.draggedTab, nextTab.nextSibling);
      const nextTabId = +nextTab.id.split("-")[1];
      chrome.tabs.get(nextTabId).then(tabDetails => {
        // console.log(tabDetails);
        chrome.tabs.move(draggedTabIdInBrowser, { index: tabDetails.index });
      });
    }
  }

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
  this.tabs = [
    ...dragState.tabsAbove,
    dragState.draggedTab,
    ...dragState.tabsBelow
  ];
  const reorderedTabObjects = [];
  state.orderedTabObjects.forEach(tabObj => {
    const newIndex = state.tabIndices[tabObj.id];
    reorderedTabObjects[newIndex] = tabObj;
  });
  state.orderedTabObjects = reorderedTabObjects;
  this.dragState = null;
}

module.exports = onDragPointerUp;
