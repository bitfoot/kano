"use strict";

function onScrollbarDragPointerUp() {
  // this.scrollState.container.scroll(
  //   0,
  //   this.scrollState.thumbDragState.scrollDistance
  // );
  this.scrollState.container.scrollBy(0, this.scrollState.tabListOffset);
  this.scrollState.tabListOffset = 0;
  this.scrollState.scrollbarThumb.onpointermove = null;
  this.scrollState.scrollbarThumb.onpointerup = null;
  this.scrollState.thumbDragState = null;
}

module.exports = onScrollbarDragPointerUp;
