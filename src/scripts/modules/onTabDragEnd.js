"use strict";

function onTabDragEnd(event) {
  const dragState = this.dragState;
  if (dragState.animation) {
    console.log(`cancelled animation from within onTabDragEnd`);
    cancelAnimationFrame(dragState.animation);
    dragState.animation = null;
  }
  // get tabList offset value, and scroll by that amount
  // remember to hide system scrollbar and add custom one that scrolls with the offset
  // const tabListOffset = Number.parseFloat(
  //   dragState.tabList.style.getPropertyValue("--y-offset") || 0
  // );
  // const tabListOffset = dragState.tabListOffset;
  const currentTabTopPosition = dragState.getUpdatedTabPos();
  // const tabTravelDistance = currentTabTopPosition - dragState.lastTabPos;
  // the container is under-scrolled by distance inside dragTab

  // console.log(
  //   `scrolling to: ${dragState.tabListOffset + dragState.tabListScrollTop}`
  // );
  // dragState.tabListContainer.scroll(
  //   0,
  //   dragState.tabListOffset + this.scrollState.scrollTop
  // );
  if (dragState.tabListOffset !== 0) {
    dragState.tabListContainer.scrollBy(0, dragState.tabListOffset);
    console.log(
      `Scrolling BY ${dragState.tabListOffset} from within onTabDragEnd`
    );
  }

  // console.log(
  //   `from onTabDragEnd, tabListOffset is ${this.scrollState.tabListOffset
  //   } but about to become 0`
  // );
  // this.scrollState.tabListOffset = 0;
  dragState.tabList.style.setProperty("--y-offset", 0 + "px");
  dragState.tabList.classList.remove("tab-list--scroll");

  dragState.tabListContainer.classList.remove("tab-list-container--no-scroll");
  dragState.tabListContainer.style.setProperty(
    "--scrolltop",
    dragState.tabListScrollTop
  );

  dragState.draggedTab.onpointermove = null;
  dragState.draggedTab.onpointerup = null;

  dragState.draggedTab.classList.remove("tab-list-item--draggable");
  // reset style values of all the tabs to their defaults
  dragState.listedTabs.forEach(tab => {
    tab.style.setProperty("--y-offset", 0);
    tab.style.setProperty("--opacity", 1);
    tab.style.setProperty("--scale", 0.99);
    tab.classList.remove("tab-list-item--moving");
  });

  if (currentTabTopPosition < dragState.initialPosition) {
    dragState.tabsAbove.forEach(t => {
      if (
        dragState.initialTabPositions[t.id] + 23 > currentTabTopPosition &&
        dragState.initialTabPositions[t.id] - dragState.margin - 23 <
        currentTabTopPosition
      ) {
        dragState.tabList.insertBefore(dragState.draggedTab, t);
        const tabId = +dragState.draggedTab.id.split("-")[1];
        const nextTabId = +t.id.split("-")[1];
        chrome.tabs.get(nextTabId).then(tabDetails => {
          // console.log(tabDetails);
          chrome.tabs.move(tabId, { index: tabDetails.index });
        });
      }
    });
  } else {
    dragState.tabsBelow.forEach(t => {
      if (
        dragState.initialTabPositions[t.id] + 23 - dragState.margin <
        currentTabTopPosition + dragState.tabHeight
      ) {
        // const tabId = +dragState.draggedTab.id.split("-")[1];
        // chrome.tabs.move(tabId, { index: -1 });
        dragState.tabList.insertBefore(dragState.draggedTab, t.nextSibling);
        const tabId = +dragState.draggedTab.id.split("-")[1];
        const nextTabId = +t.id.split("-")[1];
        chrome.tabs.get(nextTabId).then(tabDetails => {
          // console.log(tabDetails);
          chrome.tabs.move(tabId, { index: tabDetails.index });
        });
      }
    });
  }

  // dragState.draggedTab.scrollIntoView({ block: "nearest" });
  this.dragState = null;
}

module.exports = onTabDragEnd;
