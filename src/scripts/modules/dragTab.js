"use strict";

function dragTab(options = {}) {
  const { distance = 0, speed = 0 } = options;
  const dragState = this.dragState;
  console.log(`distance inside dragTab: ${distance}`);

  if (dragState) {
    const initialTabPosition = dragState.initialPosition;
    // this function should only update tabOffset

    dragState.dragOffset += distance;

    const currentMaxOffset = dragState.currentMaxOffset;
    const currentMinOffset = dragState.currentMinOffset;

    // ensure that offset does not exceed current max or min offset

    dragState.dragOffset = Math.max(
      currentMinOffset,
      Math.min(dragState.dragOffset, currentMaxOffset)
    );

    // update dragState.tabPosition here
    let filterOffset = 0;
    if (this.filterState.tabs[dragState.draggedTab.id]) {
      filterOffset = this.filterState.tabs[dragState.draggedTab.id]
        .filterOffset;
    }

    dragState.draggedTab.style.setProperty(
      "--y-offset",
      dragState.dragOffset + filterOffset + "px"
    );

    dragState.tabsAbove.forEach(tab => {
      let filterOffset = 0;
      if (this.filterState.tabs[tab.id]) {
        filterOffset = this.filterState.tabs[tab.id].filterOffset;
      } else {
        filterOffset = 0;
      }

      const totalDifference =
        dragState.offsetTops[tab.id] -
        initialTabPosition -
        dragState.dragOffset;

      // get the difference between the bottom of todo and the top of draggable todo.
      const difference = totalDifference + dragState.tabHeight;
      // calculate tab offset (should be min of 0, max of 46)
      const offset = Math.max(
        Math.min(difference * 1.3, dragState.tabHeight + dragState.margin),
        0
      );

      tab.style.setProperty("--y-offset", offset + filterOffset + "px");
      tab.style.setProperty(
        "--opacity",
        Math.max(Math.abs(offset - 23) / 23, 0.62)
      );
      // the largest sale for moving tab is 0.99. Smallest is 0.98.
      tab.style.setProperty(
        "--scale",
        Math.max(Math.abs(offset - 23) / 23 - 0.01, 0.98)
      );
    });

    dragState.tabsBelow.forEach(tab => {
      let filterOffset = 0;
      if (this.filterState.tabs[tab.id]) {
        filterOffset = this.filterState.tabs[tab.id].filterOffset;
      } else {
        filterOffset = 0;
      }

      const totalDifference =
        dragState.offsetTops[tab.id] -
        initialTabPosition -
        dragState.dragOffset;

      const difference = totalDifference - dragState.tabHeight;
      const offset = Math.min(
        Math.max(
          difference * 1.3,
          (dragState.tabHeight + dragState.margin) * -1
        ),
        0
      );

      tab.style.setProperty("--y-offset", offset + filterOffset + "px");
      tab.style.setProperty(
        "--opacity",
        Math.max(Math.abs(offset + 23) / 23, 0.62)
      );
      // the largest sale for moving tab is 0.99. Smallest is 0.98.
      tab.style.setProperty(
        "--scale",
        Math.max(Math.abs(offset + 23) / 23 - 0.01, 0.98)
      );
    });
  } else {
    // throw new Error("dragState object is not initialized");
    console.log("dragState object is not initialized");
  }
}

module.exports = dragTab;
