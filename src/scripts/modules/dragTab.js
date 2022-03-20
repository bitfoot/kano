"use strict";

function dragTab(options = {}) {
  const { distance = 0, speed = 0 } = options;
  const dragState = this.dragState;
  console.log(`distance inside dragTab: ${distance}`);

  if (dragState) {
    dragState.tabsPosInfo[dragState.draggedTab.id].dragOffset += distance;

    // ensure that offset does not exceed current max or min offset
    dragState.tabsPosInfo[dragState.draggedTab.id].dragOffset = Math.max(
      dragState.currentMinOffset,
      Math.min(
        dragState.tabsPosInfo[dragState.draggedTab.id].dragOffset,
        dragState.currentMaxOffset
      )
    );

    const draggedTabOffset =
      dragState.tabsPosInfo[dragState.draggedTab.id].dragOffset +
      dragState.tabsPosInfo[dragState.draggedTab.id].filterOffset;

    dragState.draggedTab.style.setProperty(
      "--y-offset",
      draggedTabOffset + "px"
    );

    const currentDraggedTabPos = dragState.tabPosInList;

    dragState.tabsAbove.forEach(tab => {
      const totalDifference =
        dragState.tabsPosInfo[tab.id].initialPos - currentDraggedTabPos;

      // get the difference between the bottom of tab and the top of draggable tab.
      const difference = totalDifference + dragState.tabHeight;
      // calculate tab offset (should be min of 0, max of 46)
      const offset = Math.max(
        Math.min(difference * 1.3, dragState.tabHeight + dragState.margin),
        0
      );

      tab.style.setProperty(
        "--y-offset",
        offset + dragState.tabsPosInfo[tab.id].filterOffset + "px"
      );

      const midPoint = (dragState.tabHeight + dragState.margin) / 2;
      const ratioToMidPoint = Math.abs(Math.abs(offset) - midPoint) / midPoint;
      tab.style.setProperty("--opacity", Math.max(ratioToMidPoint, 0.62));
      // the largest sale for moving tab is 0.99. Smallest is 0.98.
      tab.style.setProperty("--scale", Math.max(ratioToMidPoint - 0.01, 0.98));
    });

    dragState.tabsBelow.forEach(tab => {
      const totalDifference =
        dragState.tabsPosInfo[tab.id].initialPos - currentDraggedTabPos;

      // get the difference between the top of tab and the bottom of draggable tab.
      const difference = totalDifference - dragState.tabHeight;
      // calculate tab offset (should be max of 0, min of -46)
      const offset = Math.min(
        Math.max(
          difference * 1.3,
          (dragState.tabHeight + dragState.margin) * -1
        ),
        0
      );

      tab.style.setProperty(
        "--y-offset",
        offset + dragState.tabsPosInfo[tab.id].filterOffset + "px"
      );

      const midPoint = (dragState.tabHeight + dragState.margin) / 2;
      const ratioToMidPoint = Math.abs(Math.abs(offset) - midPoint) / midPoint;
      tab.style.setProperty("--opacity", Math.max(ratioToMidPoint, 0.62));
      // the largest scale of a moving tab is 0.99. Smallest is 0.98.
      tab.style.setProperty("--scale", Math.max(ratioToMidPoint - 0.01, 0.98));
    });
  } else {
    throw new Error("dragState object is not initialized");
  }
}

module.exports = dragTab;
