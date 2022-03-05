"use strict";

const scroll = require("./scroll");

function onScroll(e) {
  const state = this;
  const newScrolltop = e.target.scrollTop;

  let filterMaxScrollTop = null;
  const filterWasUsed = state.filterState.numOfFilteredTabs !== null;
  if (filterWasUsed) {
    let wholeContentHeight = state.filterState.numOfFilteredTabs * 46;
    filterMaxScrollTop = wholeContentHeight - e.target.offsetHeight;
    if (filterMaxScrollTop < 0) {
      filterMaxScrollTop = 0;
    }
  }

  if (filterMaxScrollTop !== null && newScrolltop > filterMaxScrollTop) {
    e.target.scroll(0, filterMaxScrollTop);
    // return;
  }

  // for positioning scrollbar track
  let scrollBarTrackOffset = null;
  if (filterMaxScrollTop !== null && newScrolltop > filterMaxScrollTop) {
    scrollBarTrackOffset = filterMaxScrollTop;
  } else {
    scrollBarTrackOffset = newScrolltop;
  }
  requestAnimationFrame(() => {
    this.scrollState.scrollbarTrack.style.setProperty(
      "--scrolltop",
      scrollBarTrackOffset + "px"
    );
  });

  // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
  const prevScrolltop = this.scrollState.scrollTop;
  // this.scrollState.scrollTop = newScrolltop;
  if (filterMaxScrollTop !== null && newScrolltop > filterMaxScrollTop) {
    this.scrollState.scrollTop = filterMaxScrollTop;
  } else {
    this.scrollState.scrollTop = newScrolltop;
  }

  let previousTabListOffset = this.scrollState.tabListOffset;
  let distanceToScrollBy = newScrolltop - prevScrolltop - previousTabListOffset;

  // let distanceToScrollBy = newScrolltop - prevScrolltop - previousTabListOffset;
  this.scrollState.tabListOffset = 0;

  const scrollOptions = {
    distance: distanceToScrollBy,
    scrollBarOnly: true
  };

  scroll.call(this, scrollOptions);
}

module.exports = onScroll;
