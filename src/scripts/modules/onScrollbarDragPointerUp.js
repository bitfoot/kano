"use strict";

function onScrollbarDragPointerUp() {
  this.scrollState.container.scrollBy(0, this.scrollState.tabListOffset);
  this.tabList.style.setProperty("--y-offset", 0 + "px");
  this.scrollState.scrollbarThumb.onpointermove = null;
  this.scrollState.scrollbarThumb.onpointerup = null;
  this.scrollState.thumbDragState = null;
}

module.exports = onScrollbarDragPointerUp;
