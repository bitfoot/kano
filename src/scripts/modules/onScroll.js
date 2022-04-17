"use strict";

const scroll = require("./scroll");
const onScrollbarDragPointerUp = require("./onScrollbarDragPointerUp");

function onScroll(e) {
  if (this.scrollState.thumbDragState) {
    onScrollbarDragPointerUp.call(this);
  }

  let newScrollTop = e.target.scrollTop;
  let prevScrolltop = this.scrollState.scrollTop;

  if (this.scrollState.adjustingScrollbar == true) {
    if (newScrollTop <= this.scrollState.maxScrollTop) {
      this.scrollState.adjustingScrollbar = false;
      this.scrollState.container.classList.remove(
        "tab-list-container--no-scroll"
      );
    }
  } else if (newScrollTop > this.scrollState.maxScrollTop) {
    newScrollTop = this.scrollState.maxScrollTop;
    e.target.scrollTop = newScrollTop;
  }

  requestAnimationFrame(() => {
    this.scrollState.scrollbarTrack.style.setProperty(
      "--scrolltop",
      newScrollTop + "px"
    );
  });

  // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow

  this.scrollState.scrollTop = newScrollTop;
  let previousTabListOffset = this.scrollState.tabListOffset;
  let distanceToScrollBy =
    Math.min(newScrollTop, this.scrollState.maxScrollTop) -
    Math.min(prevScrolltop, this.scrollState.maxScrollTop) -
    previousTabListOffset;
  this.scrollState.tabListOffset = 0;

  const scrollOptions = {
    distance: distanceToScrollBy,
    scrollBarOnly: true
  };

  scroll.call(this, scrollOptions);
}

module.exports = onScroll;
