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
    dragState.tabOffset += distance;
    // dragState.tabOffset = Math.max(
    //   dragState.maxTabOffsetAbove,
    //   Math.min(dragState.tabOffset, dragState.maxTabOffsetBelow)
    // );

    const currentMaxOffsetBelow =
      dragState.maxTabOffsetBelow -
      dragState.maxScrollTop +
      dragState.tabListOffset +
      dragState.tabListScrollTop;

    const currentMaxOffsetAbove =
      dragState.maxTabOffsetAbove +
      dragState.tabListOffset +
      dragState.tabListScrollTop;

    console.log(`currentMaxOffsetAbove is: ${currentMaxOffsetAbove}`);

    dragState.tabOffset = Math.max(
      currentMaxOffsetAbove,
      Math.min(dragState.tabOffset, currentMaxOffsetBelow)
    );

    // const container = document.getElementById("tab-list-container");
    // const content = container.children[0];
    // const margin = 6;
    // const visibleContentHeight = container.offsetHeight - margin; // 500
    // const wholeContentHeight = container.scrollHeight - margin;
    // const hiddenContentHeight = wholeContentHeight - visibleContentHeight;

    // console.log(`currentMaxOffset: ${currentMaxOffset}`);

    // console.log(
    //   `maxTabOffsetBelow: ${dragState.maxTabOffsetBelow}, tabListOffset: ${dragState.tabListOffset
    //   }, maxScrollTop: ${dragState.maxScrollTop}`
    // );
    dragState.lastTabPos = dragState.getUpdatedTabPos();

    dragState.draggedTab.style.setProperty(
      "--y-offset",
      dragState.tabOffset + "px"
    );

    dragState.tabsAbove.forEach(tab => {
      const totalDifference =
        dragState.initialTabPositions[tab.id] -
        initialTabPosition -
        dragState.tabOffset;

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

    // this breaks down when drag starts after list is scrolled down a bit

    dragState.tabsBelow.forEach(tab => {
      const totalDifference =
        dragState.initialTabPositions[tab.id] -
        initialTabPosition -
        dragState.tabOffset;

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
