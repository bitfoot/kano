"use strict";

// rename this function to scrollBy
function scroll(options = {}) {
  const { distance = 0, scrollBarOnly = false, speed = 0 } = options;
  const state = this;
  const dragState = state.dragState;
  // all this stuff about ratio should be handled by adjust Scrollbar and stored in scrollState

  let contentHeight = null;
  const container = state.scrollState.container;
  const tabList = container.children[0];
  const filterWasUsed = state.filterState.numOfFilteredTabs !== null;
  if (filterWasUsed) {
    contentHeight = state.filterState.numOfFilteredTabs * 46;
  } else {
    contentHeight = tabList.offsetHeight;
  }

  const containerHeight = container.offsetHeight;
  const scrollbarThumb = state.scrollState.scrollbarThumb;
  const containerToContentRatio = containerHeight / contentHeight;
  const curThumbOffset = state.scrollState.thumbOffset;
  const scrollbarDistance = distance * containerToContentRatio;
  // console.log(`scrollbarDistance: ${scrollbarDistance}`);
  const maxThumbOffset =
    (contentHeight - containerHeight) * containerToContentRatio;
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
      tabList.classList.add("tab-list--scroll");
      const newOffset = dragState.tabListOffset * -1;
      tabList.style.setProperty("--y-offset", newOffset + "px");
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
      tabList.style.setProperty("--y-offset", newOffset + "px");
    }
  }
}

module.exports = scroll;
