"use strict";

function onTabDragEnd(event) {
  const dragState = this.dragState;
  if (dragState.animation) {
    cancelAnimationFrame(dragState.animation);
    dragState.animation = null;
  }
  // get tabList offset value, and scroll by that amount
  // remember to hide system scrollbar and add custom one that scrolls with the offset
  const tabListOffset = Number.parseFloat(
    dragState.tabList.style.getPropertyValue("--y-offset") || 0
  );
  dragState.tabList.style.setProperty("--y-offset", 0 + "px");
  dragState.tabList.classList.remove("tab-list--scroll");
  dragState.tabListContainer.scroll(
    0,
    (tabListOffset - dragState.tabListScrollTop) * -1
  );
  dragState.tabListContainer.style.setProperty(
    "--scrolltop",
    dragState.tabListScrollTop
  );

  dragState.draggedTab.onpointermove = null;
  dragState.draggedTab.onpointerup = null;
  const currentTabTopPosition =
    event.pageY - dragState.shiftY + dragState.tabListScrollTop;

  dragState.draggedTab.classList.remove("tab-list-item--draggable");
  dragState.listedTabs.forEach(t => {
    t.style.setProperty("--y-offset", 0);
    t.classList.remove("tab-list-item--moveable", "tab-list-item--moving");
  });

  if (
    currentTabTopPosition <
    dragState.initialTabPositions[dragState.draggedTab.id]
  ) {
    dragState.tabsAbove.forEach(t => {
      if (
        dragState.initialTabPositions[t.id] + 23 > currentTabTopPosition &&
        dragState.initialTabPositions[t.id] - dragState.margin - 23 <
        currentTabTopPosition
      ) {
        dragState.tabList.insertBefore(dragState.draggedTab, t);
      }
    });
  } else if (
    currentTabTopPosition >
    dragState.initialTabPositions[dragState.draggedTab.id]
  ) {
    dragState.tabsBelow.forEach(t => {
      if (
        dragState.initialTabPositions[t.id] + 23 - dragState.margin <
        currentTabTopPosition + dragState.tabHeight
      ) {
        dragState.tabList.insertBefore(dragState.draggedTab, t.nextSibling);
      }
    });
  }

  this.dragState = null;
}

module.exports = onTabDragEnd;
