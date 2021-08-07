"use strict";

// this function will move tab up or down, depending on whether the distance value is positive or negative

function dragTab(options = {}) {
  const { distance = 0, speed = 0 } = options;
  const dragState = this.dragState;
  console.log(`distance inside dragTab: ${distance}`);

  if (dragState) {
    const initialTabPosition =
      dragState.initialTabPositions[dragState.draggedTab.id];

    // const currentTabPosition = dragState.getTabTopPosInList();
    // const newTabPosition = currentTabPosition + distance;

    // change position of the dragged tab, ensuring it doesn't exceed the max
    // if (dragState.tabListOffset == 0) {
    // dragState.tabOffset += distance;
    dragState.tabOffset += distance;
    dragState.tabOffset = Math.min(
      dragState.tabOffset,
      dragState.maxTabOffsetBelow
    );
    // console.log(`max tab offset below: ${dragState.maxTabOffsetBelow}`);
    // }

    // console.log(dragState.tabOffset);

    // if (dragState.maxTabOffsetBelow <= dragState.tabOffset) {}

    dragState.draggedTab.style.setProperty(
      "--y-offset",
      dragState.tabOffset + "px"
    );

    dragState.tabsAbove.forEach(tab => {
      const totalDifference =
        dragState.initialTabPositions[tab.id] -
        initialTabPosition -
        dragState.tabOffset -
        this.scrollTop -
        dragState.tabListOffset;

      // console.log(dragState.getUpdatedTabPos(), totalDifference);
      // get the difference between the bottom of todo and the top of draggable todo.
      const difference = totalDifference + dragState.tabHeight;
      // calculate tab offset (should be min of 0, max of 46)
      const offset = Math.max(
        Math.min(difference * 1.3, dragState.tabHeight + dragState.margin),
        0
      );

      tab.style.setProperty("--y-offset", offset + "px");
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
      const totalDifference =
        dragState.initialTabPositions[tab.id] -
        initialTabPosition -
        dragState.tabOffset -
        this.scrollTop;
      // dragState.tabListOffset;
      const difference = totalDifference - dragState.tabHeight;
      const offset = Math.min(
        Math.max(
          difference * 1.3,
          (dragState.tabHeight + dragState.margin) * -1
        ),
        0
      );

      tab.style.setProperty("--y-offset", offset + "px");
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
    throw new Error("dragState object is not initialized");
  }
}

module.exports = dragTab;
