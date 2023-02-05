"use strict";

import { scroll } from "./scroll";
import { onScrollbarDragPointerUp } from "./onScrollbarDragPointerUp";

function onScroll(e) {
  const scrollState = this.scrollState;
  if (scrollState.thumbDragState) {
    onScrollbarDragPointerUp.call(this);
  }

  let newScrollTop = e.target.scrollTop;
  let prevScrolltop = scrollState.scrollTop;

  if (scrollState.adjustingScrollbar === true) {
    if (newScrollTop <= scrollState.maxScrollTop) {
      scrollState.adjustingScrollbar = false;
      requestAnimationFrame(() => {
        scrollState.container.classList.remove("tab-list-container--no-scroll");
      });
    }
  } else if (newScrollTop > scrollState.maxScrollTop) {
    newScrollTop = scrollState.maxScrollTop;
    e.target.scrollTop = newScrollTop;
  }

  requestAnimationFrame(() => {
    scrollState.scrollbarTrack.style.setProperty(
      "--scrolltop",
      newScrollTop + "px"
    );
  });

  // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
  scrollState.scrollTop = newScrollTop;
  let previousTabListOffset = scrollState.tabListOffset;
  let distanceToScrollBy =
    Math.min(newScrollTop, scrollState.maxScrollTop) -
    Math.min(prevScrolltop, scrollState.maxScrollTop) -
    previousTabListOffset;
  scrollState.tabListOffset = 0;

  const scrollOptions = {
    distance: distanceToScrollBy,
    scrollBarOnly: true
  };

  scroll.call(this, scrollOptions);
}

export { onScroll };
