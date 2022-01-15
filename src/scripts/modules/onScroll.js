"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");

// function onScroll(e) {
//   // return;
//   // console.log(e);
//   // const document = e.target;
//   const container = document.getElementById("tab-list-container");
//   // const container = e.target;
//   const prevScrolltop = this.scrollState.scrollTop;
//   const currScrolltop = container.scrollTop;
//   // const currScrolltop = 0;
//   // document.documentElement.style.setProperty(
//   //   "--scrolltop",
//   //   currScrolltop + "px"
//   // );
//   requestAnimationFrame(() => {
//     this.scrollState.scrollbarTrack.style.setProperty(
//       "--scrolltop",
//       currScrolltop + "px"
//     );
//   });
//   // console.log(`scroll event fired. scrolltop is ${currScrolltop}`);
//   // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
//   this.scrollState.scrollTop = currScrolltop;
//   let previousTabListOffset = null;
//   let distanceToScrollBy = null;
//   if (this.dragState) {
//     previousTabListOffset = this.dragState.tabListOffset;
//     distanceToScrollBy = currScrolltop - prevScrolltop;
//   } else {
//     previousTabListOffset = this.scrollState.tabListOffset;
//     distanceToScrollBy = currScrolltop - prevScrolltop - previousTabListOffset;
//   }
//   this.scrollState.tabListOffset = 0;

//   if (this.dragState) {
//     this.dragState.tabListScrollTop = currScrolltop;
//   }

//   // console.log(
//   //   `currScrolltop: ${currScrolltop}, prevScrolltop: ${prevScrolltop}, tabListOffset: ${previousTabListOffset}, distance to "scroll" by: ${distanceToScrollBy}, thumbOffset: ${this.scrollState.thumbOffset
//   //   }, dragState: ${Boolean(this.dragState)}`
//   // );

//   const scrollOptions = {
//     distance: distanceToScrollBy,
//     scrollBarOnly: true
//   };

//   scroll.call(this, scrollOptions);

//   // check if a tab is being dragged right now
//   // if so, drag the tab to keep up with the changing scrolltop
//   if (
//     this.dragState &&
//     this.dragState.tabListOffset + currScrolltop <
//     this.dragState.maxScrollTop &&
//     this.dragState.tabListScrollTop + this.dragState.tabListOffset > 0
//   ) {
//     // console.log(
//     //   `tabListOffset: ${this.dragState.tabListOffset}, maxScrollTop: ${this.dragState.maxScrollTop
//     //   }`
//     // );
//     dragTab.call(this, {
//       distance: distanceToScrollBy
//     });
//   }
// }

function onScroll(e) {
  const newScrolltop = e.target.scrollTop;

  // for positioning scrollbar track
  requestAnimationFrame(() => {
    this.scrollState.scrollbarTrack.style.setProperty(
      "--scrolltop",
      newScrolltop + "px"
    );
  });

  // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
  const prevScrolltop = this.scrollState.scrollTop;
  this.scrollState.scrollTop = newScrolltop;

  let previousTabListOffset = this.scrollState.tabListOffset;
  let distanceToScrollBy = newScrolltop - prevScrolltop - previousTabListOffset;

  this.scrollState.tabListOffset = 0;

  const scrollOptions = {
    distance: distanceToScrollBy,
    scrollBarOnly: true
  };

  scroll.call(this, scrollOptions);
}

// function onScroll(e) {
//   // console.log(`fired`);
//   const container = document.getElementById("tab-list-container");
//   const currScrolltop = container.scrollTop;

//   // for positioning scrollbar track
//   requestAnimationFrame(() => {
//     this.scrollState.scrollbarTrack.style.setProperty(
//       "--scrolltop",
//       currScrolltop + "px"
//     );
//   });

//   // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
//   const prevScrolltop = this.scrollState.scrollTop;
//   this.scrollState.scrollTop = currScrolltop;

//   let previousTabListOffset = null;
//   let distanceToScrollBy = null;
//   if (this.dragState) {
//     // this.dragState.tabListScrollTop = this.scrollState.scrollTop;
//     previousTabListOffset = this.dragState.tabListOffset;
//     distanceToScrollBy = currScrolltop - prevScrolltop;
//   } else {
//     previousTabListOffset = this.scrollState.tabListOffset;
//     distanceToScrollBy = currScrolltop - prevScrolltop - previousTabListOffset;
//   }
//   this.scrollState.tabListOffset = 0;

//   const scrollOptions = {
//     distance: distanceToScrollBy,
//     scrollBarOnly: true
//   };

//   scroll.call(this, scrollOptions);
// }

module.exports = onScroll;
