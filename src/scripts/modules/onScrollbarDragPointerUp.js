"use strict";

function onScrollbarDragPointerUp() {
  this.scrollState.container.scrollBy(0, this.scrollState.tabListOffset);
  const tabList = this.tabList;
  window.requestAnimationFrame(() => {
    tabList.style.setProperty("--y-offset", 0 + "px");
  });
  this.scrollState.scrollbarThumb.onpointermove = null;
  this.scrollState.scrollbarThumb.onpointerup = null;
  this.scrollState.thumbDragState = null;
}

export { onScrollbarDragPointerUp };
