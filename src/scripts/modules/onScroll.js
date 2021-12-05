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
  // console.log(`fired`);
  const container = document.getElementById("tab-list-container");
  const currScrolltop = container.scrollTop;

  // for positioning scrollbar track
  requestAnimationFrame(() => {
    let srollbarOffset = currScrolltop;
    if (currScrolltop < this.tabListContentHeight) {
      srollbarOffset = this.tabListContentHeight;
    } else if (currScrolltop > this.tabListContentHeight * 2 - 506) {
      srollbarOffset = this.tabListContentHeight * 2 - 506;
    }
    this.scrollState.scrollbarTrack.style.setProperty(
      "--scrolltop",
      srollbarOffset + "px"
    );
  });

  if (
    currScrolltop + this.scrollState.tabListOffset <
    this.tabListContentHeight
  ) {
    container.scroll(
      0,
      this.tabListContentHeight + this.scrollState.tabListOffset
    );
    console.log(
      `numero uno. currScrolltop: ${currScrolltop}, tabListContentHeight: ${this.tabListContentHeight
      }`
    );
    this.scrollState.tabListOffset = 0;
    return;
  } else if (currScrolltop > this.tabListContentHeight * 2 - 506) {
    console.log(
      `NUMERO DOSSS currScrolltop: ${currScrolltop}, tabListOffset: ${this.scrollState.tabListOffset
      }, tabListContentHeight: ${this.tabListContentHeight}`
    );
    container.scroll(0, this.tabListContentHeight * 2 - 506);
    console.log("numero dos");
    // this.scrollState.tabListOffset = 0;
    return;
  }

  // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
  this.scrollState.scrollTop = currScrolltop;
  // const prevScrolltop = this.scrollState.scrollTop;
  const specialScrolltop = currScrolltop - this.tabListContentHeight;
  const prevSpecialScrolltop = this.scrollState.specialScrolltop;
  this.scrollState.specialScrolltop = specialScrolltop;
  let previousTabListOffset = null;
  let distanceToScrollBy = null;
  if (this.dragState) {
    // this.dragState.tabListScrollTop = this.scrollState.scrollTop;
    previousTabListOffset = this.dragState.tabListOffset;
    distanceToScrollBy = specialScrolltop - prevSpecialScrolltop;
  } else {
    previousTabListOffset = this.scrollState.tabListOffset;
    distanceToScrollBy =
      specialScrolltop - prevSpecialScrolltop - previousTabListOffset;
  }
  this.scrollState.tabListOffset = 0;

  // console.log(
  //   `previousTabListOffset: ${previousTabListOffset}, distanceToScrollBy: ${distanceToScrollBy}, prevSpecialScrolltop: ${prevSpecialScrolltop}`
  // );

  if (this.dragState) {
    this.dragState.tabListScrollTop = specialScrolltop;
  }

  // console.log(
  //   `currScrolltop: ${currScrolltop}, prevScrolltop: ${prevScrolltop}, tabListOffset: ${previousTabListOffset}, distance to "scroll" by: ${distanceToScrollBy}, thumbOffset: ${this.scrollState.thumbOffset
  //   }, dragState: ${Boolean(this.dragState)}`
  // );

  const scrollOptions = {
    distance: distanceToScrollBy,
    scrollBarOnly: true
  };

  scroll.call(this, scrollOptions);

  // check if a tab is being dragged right now
  // if so, drag the tab to keep up with the changing scrolltop
  if (
    // this.dragState &&
    // this.dragState.tabListOffset + currScrolltop <
    // this.dragState.maxScrollTop &&
    // this.dragState.tabListScrollTop + this.dragState.tabListOffset > 0
    this.dragState
  ) {
    // console.log(
    //   `tabListOffset: ${this.dragState.tabListOffset}, maxScrollTop: ${this.dragState.maxScrollTop
    //   }`
    // );
    dragTab.call(this, {
      distance: distanceToScrollBy
    });
  }
}

module.exports = onScroll;
