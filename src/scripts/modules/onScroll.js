"use strict";

const scroll = require("./scroll");

function onScroll(e) {
  let newScrollTop = e.target.scrollTop;

  if (newScrollTop > this.scrollState.maxScrollTop) {
    newScrollTop = this.scrollState.maxScrollTop;
    e.target.scroll(0, this.scrollState.maxScrollTop);
  }

  // for positioning scrollbar track
  let scrollBarTrackOffset = null;
  if (newScrollTop > this.scrollState.maxScrollTop) {
    scrollBarTrackOffset = this.scrollState.maxScrollTop;
  } else {
    scrollBarTrackOffset = newScrollTop;
  }
  requestAnimationFrame(() => {
    this.scrollState.scrollbarTrack.style.setProperty(
      "--scrolltop",
      scrollBarTrackOffset + "px"
    );
  });

  // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
  const prevScrolltop = this.scrollState.scrollTop;
  this.scrollState.scrollTop = newScrollTop;
  let previousTabListOffset = this.scrollState.tabListOffset;
  let distanceToScrollBy = newScrollTop - prevScrolltop - previousTabListOffset;
  this.scrollState.tabListOffset = 0;

  const scrollOptions = {
    distance: distanceToScrollBy,
    scrollBarOnly: true
  };

  scroll.call(this, scrollOptions);
}
// function onScroll(e) {
//   const state = this;
//   const newScrolltop = e.target.scrollTop;

//   const filterWasUsed = state.filterState.numOfFilteredTabs !== null;
//   let filterMaxScrollTop = null;
//   if (filterWasUsed) {
//     let contentHeight = state.filterState.numOfFilteredTabs * 46;
//     filterMaxScrollTop = contentHeight - this.scrollState.maxContainerHeight;
//     if (filterMaxScrollTop < 0) {
//       filterMaxScrollTop = 0;
//     }
//     console.log(`filterMaxScrollTop: ${filterMaxScrollTop}`);
//   }

//   if (filterMaxScrollTop !== null && newScrolltop > filterMaxScrollTop) {
//     e.target.scroll(0, filterMaxScrollTop);
//     // return;
//   }

//   // for positioning scrollbar track
//   let scrollBarTrackOffset = null;
//   if (filterMaxScrollTop !== null && newScrolltop > filterMaxScrollTop) {
//     scrollBarTrackOffset = filterMaxScrollTop;
//   } else {
//     scrollBarTrackOffset = newScrolltop;
//   }
//   requestAnimationFrame(() => {
//     this.scrollState.scrollbarTrack.style.setProperty(
//       "--scrolltop",
//       scrollBarTrackOffset + "px"
//     );
//   });

//   // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
//   const prevScrolltop = this.scrollState.scrollTop;
//   if (filterMaxScrollTop !== null) {
//     this.scrollState.scrollTop = filterMaxScrollTop;
//   } else {
//     this.scrollState.scrollTop = newScrolltop;
//   }

//   let previousTabListOffset = this.scrollState.tabListOffset;
//   let distanceToScrollBy = newScrolltop - prevScrolltop - previousTabListOffset;
//   console.log(`distanceToScrollBy: ${distanceToScrollBy}`);

//   // let distanceToScrollBy = newScrolltop - prevScrolltop - previousTabListOffset;
//   this.scrollState.tabListOffset = 0;

//   const scrollOptions = {
//     distance: distanceToScrollBy,
//     scrollBarOnly: true
//   };

//   scroll.call(this, scrollOptions);
// }

module.exports = onScroll;
