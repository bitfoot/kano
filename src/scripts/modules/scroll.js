"use strict";

// rename this function to scrollBy
function scroll(options = {}) {
  const { distance = 0, scrollBarOnly = false, speed = 0 } = options;
  const state = this;
  const dragState = state.dragState;
  // all this stuff about ratio should be handled by adjust Scrollbar and stored in scrollState
  const container = state.scrollState.container;
  const scrollbarThumb = state.scrollState.scrollbarThumb;
  const content = container.children[0];
  const margin = 6;
  const visibleContentHeight = container.offsetHeight - margin; // 500
  const entireContentHeight = content.offsetHeight - margin;
  const containerToContentRatio = visibleContentHeight / entireContentHeight;
  const curThumbOffset = state.scrollState.thumbOffset;
  const scrollbarDistance = distance * containerToContentRatio;
  console.log(`scrollbarDistance: ${scrollbarDistance}`);
  const maxThumbOffset =
    (entireContentHeight - visibleContentHeight) * containerToContentRatio;
  const newThumbOffset = Math.max(
    0,
    Math.min(curThumbOffset + scrollbarDistance, maxThumbOffset)
  );

  state.scrollState.thumbOffset = newThumbOffset;
  scrollbarThumb.style.setProperty("--thumb-offset", newThumbOffset + "px");

  if (dragState) {
    // if scrolling using drag (from onDragPointerMove)
    if (!scrollBarOnly) {
      dragState.tabListOffset += distance;
      dragState.tabListOffset = Math.min(
        dragState.tabListOffset,
        dragState.maxScrollTop - state.scrollState.scrollTop
      );
      dragState.tabListOffset = Math.max(
        dragState.tabListOffset,
        state.scrollState.scrollTop * -1
      );
      state.scrollState.tabListOffset = dragState.tabListOffset;
      content.classList.add("tab-list--scroll");
      const newOffset = dragState.tabListOffset * -1;
      content.style.setProperty("--y-offset", newOffset + "px");
    } else {
      dragState.tabListOffset = Math.min(
        dragState.tabListOffset,
        dragState.maxScrollTop - state.scrollState.scrollTop
      );
      dragState.tabListOffset = Math.max(
        dragState.tabListOffset,
        state.scrollState.scrollTop * -1
      );
      state.scrollState.tabListOffset = dragState.tabListOffset;
      const newOffset = dragState.tabListOffset * -1;
      content.style.setProperty("--y-offset", newOffset + "px");
    }
  }
}

module.exports = scroll;
