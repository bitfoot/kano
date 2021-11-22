"use strict";

// rename this function to scrollBy
function scroll(options = {}) {
  const { distance = 0, scrollBarOnly = false, speed = 0 } = options;
  const dragState = this.dragState;
  const container = document.getElementById("tab-list-container");
  const scrollbarThumb = document.getElementById("scrollbar-thumb");
  const content = container.children[0];
  const margin = 6;
  const visibleContentHeight = container.offsetHeight - margin; // 500
  const entireContentHeight = content.offsetHeight - margin;
  const containerToContentRatio = visibleContentHeight / entireContentHeight;
  const curThumbOffset = this.scrollState.thumbOffset;
  const scrollbarDistance = distance * containerToContentRatio;
  console.log(`scrollbarDistance: ${scrollbarDistance}`);
  const maxThumbOffset =
    (entireContentHeight - visibleContentHeight) * containerToContentRatio;
  const newThumbOffset = Math.max(
    0,
    Math.min(curThumbOffset + scrollbarDistance, maxThumbOffset)
  );

  this.scrollState.thumbOffset = newThumbOffset;

  scrollbarThumb.style.setProperty("--thumb-offset", newThumbOffset + "px");

  if (dragState) {
    // if scrolling using drag (from onTabDrag)
    if (!scrollBarOnly) {
      dragState.tabListOffset += distance;
      dragState.tabListOffset = Math.min(
        dragState.tabListOffset,
        dragState.maxScrollTop - dragState.tabListScrollTop
      );
      dragState.tabListOffset = Math.max(
        dragState.tabListOffset,
        dragState.tabListScrollTop * -1
      );
      this.scrollState.tabListOffset = dragState.tabListOffset;
      content.classList.add("tab-list--scroll");
      const newOffset = dragState.tabListOffset * -1;
      content.style.setProperty("--y-offset", newOffset + "px");
    } else {
      // if scrolling using wheel
      dragState.tabListOffset = Math.min(
        dragState.tabListOffset,
        dragState.maxScrollTop - dragState.tabListScrollTop
      );
      dragState.tabListOffset = Math.max(
        dragState.tabListOffset,
        dragState.tabListScrollTop * -1
      );
      this.scrollState.tabListOffset = dragState.tabListOffset;
      const newOffset = dragState.tabListOffset * -1;
      content.style.setProperty("--y-offset", newOffset + "px");
    }
  }
}

module.exports = scroll;
