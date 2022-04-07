"use strict";

const scroll = require("./scroll");

function onScroll(e) {
  let newScrollTop = e.target.scrollTop;
  let prevScrolltop = this.scrollState.scrollTop;
  const difference = newScrollTop - prevScrolltop;
  console.log(`difference: ${difference}`);

  // for positioning scrollbar track
  // requestAnimationFrame(() => {
  //   this.scrollState.scrollbarTrack.style.setProperty(
  //     "--scrolltop",
  //     Math.min(newScrollTop, this.scrollState.maxScrollTop) + "px"
  //   );
  // });
  // requestAnimationFrame(() => {
  //   this.scrollState.scrollbarTrack.style.setProperty(
  //     "--scrolltop",
  //     newScrollTop + "px"
  //   );
  // });

  // solution for the issue of filtered-out tabs getting hidden immediately, if they are at the end of the list:
  // disable user scolling by adding class to container, but smooth-scroll programmatically to max scrolltop.
  // from there, enable user-scrolling so user can interrupt.

  if (this.scrollState.adjustingScrollbar) {
    if (newScrollTop <= this.scrollState.maxScrollTop) {
      this.scrollState.adjustingScrollbar = false;
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
  // let prevScrolltop = Math.min(
  //   this.scrollState.scrollTop,
  //   this.scrollState.maxScrollTop
  // );

  // if (prevScrolltop > this.scrollState.maxScrollTop) {
  //   prevScrolltop = this.scrollState.maxScrollTop;
  // }
  // if (this.filterState.scrollingUp) {
  //   if (newScrollTop > prevScrolltop || newScrollTop === 0) {
  //     this.filterState.scrollingUp = false;
  //   }
  // }
  // console.log(
  //   `ratio: ${this.scrollState.containerToContentRatio}, prevRatio: ${this.scrollState.prevContainerToContentRatio
  //   }`
  // );

  // this.scrollState.scrollTop = newScrollTop;
  this.scrollState.scrollTop = Math.min(
    newScrollTop,
    this.scrollState.maxScrollTop
  );
  let previousTabListOffset = this.scrollState.tabListOffset;
  // let distanceToScrollBy =
  //   this.scrollState.scrollTop - prevScrolltop - previousTabListOffset;
  let distanceToScrollBy = difference - previousTabListOffset;
  this.scrollState.tabListOffset = 0;
  // console.log(
  //   `newScrollTop: ${newScrollTop}, distanceToScrollBy: ${distanceToScrollBy}, maxScrollTop: ${this.scrollState.maxScrollTop
  //   }, thumbOffset before scroll: ${this.scrollState.thumbOffset}`
  // );
  console.log(
    `newScrollTop: ${newScrollTop}, ratio: ${this.scrollState.containerToContentRatio
    }, prevRatio: ${this.scrollState.prevContainerToContentRatio
    }, distanceToScrollBy: ${distanceToScrollBy}, thumbOffset before scroll: ${this.scrollState.thumbOffset
    }`
  );

  // if (
  //   this.scrollState.adjustingScrollbar == true &&
  //   prevScrolltop > this.scrollState.maxScrollTop
  // ) {
  //   distanceToScrollBy = 0;
  //   this.scrollState.adjustingScrollbar = false;
  // } else {
  //   distanceToScrollBy = newScrollTop - prevScrolltop - previousTabListOffset;
  // }

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
