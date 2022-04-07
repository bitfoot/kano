"use strict";

// const getContainerToContentRatio = require("./util").getContainerToContentRatio;
// const getMaxScrollTop = require("./util").getMaxScrollTop;

// rename this function to scrollBy
function scroll(options = {}) {
  const { distance = 0, scrollBarOnly = false, speed = 0 } = options;
  const state = this;
  const dragState = state.dragState;
  const container = state.scrollState.container;
  const tabList = container.children[0];
  const scrollbarThumb = state.scrollState.scrollbarThumb;
  const curThumbOffset = state.scrollState.thumbOffset;

  // const ratio = getContainerToContentRatio.call(this);
  // this.scrollState.containerToContentRatio = getContainerToContentRatio.call(
  //   this
  // );
  // let scrollbarDistance = null;
  // let containerToContentRatio = null;
  // if (this.filterState.scrollingUp) {
  //   console.log(
  //     `inside scroll, prevContainerToContentRatio is ${this.scrollState.prevContainerToContentRatio
  //     }`
  //   );
  //   containerToContentRatio = this.scrollState.prevContainerToContentRatio;
  //   // scrollbarDistance = 0;
  // } else {
  //   containerToContentRatio = this.scrollState.containerToContentRatio;
  // }

  // if (this.scrollState.prevContainerToContentRatio != null) {
  //   scrollbarDistance = distance * this.scrollState.prevContainerToContentRatio;
  //   // this.scrollState.adjustingScrollbar = false;
  // } else {
  //   scrollbarDistance = distance * this.scrollState.containerToContentRatio;
  // }

  const scrollbarDistance = distance * this.scrollState.containerToContentRatio;

  // console.log(
  //   `inside scroll, scrollbarDistance is ${scrollbarDistance}, containerToContentRatio: ${this.scrollState.containerToContentRatio
  //   }`
  // );
  const newThumbOffset = Math.max(
    0,
    Math.min(
      curThumbOffset + scrollbarDistance,
      state.scrollState.maxScrollbarThumbOffset
    )
  );
  // const newThumbOffset = Math.min(
  //   curThumbOffset + scrollbarDistance,
  //   state.scrollState.maxScrollbarThumbOffset
  // );
  // const newThumbOffset = curThumbOffset + scrollbarDistance;

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
