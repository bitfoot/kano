"use strict";

function dragTab(options = {}) {
  const { distance = 0 } = options;
  // const dragState = this.dragState;
  const dragState = this.dragState;
  if (!dragState) throw new Error("dragState is not initialized");

  dragState.tabsPosInfo[dragState.draggedTab.id].dragOffset += distance;

  // ensure that offset does not exceed current max or min offset
  dragState.tabsPosInfo[dragState.draggedTab.id].dragOffset = Math.max(
    dragState.currentMinOffset,
    Math.min(
      dragState.tabsPosInfo[dragState.draggedTab.id].dragOffset,
      dragState.currentMaxOffset
    )
  );

  // const draggedTabOffset =
  //   dragState.tabsPosInfo[dragState.draggedTab.id].dragOffset +
  //   dragState.tabsPosInfo[dragState.draggedTab.id].filterOffset;

  const draggedTabOffset =
    dragState.tabsPosInfo[dragState.draggedTab.id].dragOffset;

  window.requestAnimationFrame(() => {
    dragState.draggedTab.style.setProperty(
      "--drag-offset",
      draggedTabOffset + "px"
    );
  });

  const currentDraggedTabPos = dragState.tabPosInList;

  const setStyleVariables = options => {
    const { tab, offset } = options;
    const ratioToMidPoint =
      Math.abs(Math.abs(offset) - dragState.midPoint) / dragState.midPoint;

    requestAnimationFrame(() => {
      // tab.style.setProperty(
      //   "--y-offset",
      //   offset + dragState.tabsPosInfo[tab.id].filterOffset + "px"
      // );
      tab.style.setProperty("--drag-offset", offset + "px");
      tab.style.setProperty("--opacity", Math.max(ratioToMidPoint, 0.4));
      tab.style.setProperty("--scale", Math.max(ratioToMidPoint - 0.01, 0.97));
    });
  };

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
    dragState.tabsPosInfo[tab.id].dragOffset = offset;

    const options = {
      tab,
      offset
    };
    setStyleVariables(options);
  });

  dragState.tabsBelow.forEach(tab => {
    const totalDifference =
      dragState.tabsPosInfo[tab.id].initialPos - currentDraggedTabPos;

    // get the difference between the top of tab and the bottom of draggable tab.
    const difference = totalDifference - dragState.tabHeight;
    // calculate tab offset (should be max of 0, min of -46)
    const offset = Math.min(
      Math.max(difference * 1.3, (dragState.tabHeight + dragState.margin) * -1),
      0
    );
    dragState.tabsPosInfo[tab.id].dragOffset = offset;

    const options = {
      tab,
      offset
    };
    setStyleVariables(options);
  });
}

module.exports = dragTab;
