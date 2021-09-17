"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");

function onScroll(e) {
  // return;
  // console.log(e);
  const container = e.target;
  const previousTabListOffset = this.scrollState.tabListOffset;
  this.scrollState.tabListOffset = 0;
  const prevScrolltop = this.scrollState.scrollTop;
  const currScrolltop = container.scrollTop;
  let distanceToScrollBy =
    currScrolltop - prevScrolltop - previousTabListOffset;
  // let distanceToScrollBy = null;
  // if (previousTabListOffset == 0) {
  //   distanceToScrollBy = currScrolltop - prevScrolltop;
  // }
  // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
  this.scrollState.scrollTop = currScrolltop;
  // while dragState is active, this function is not even called UNLESS someone scrolls while dragging
  // if (this.dragState) {
  //   console.log("dragState is still active");
  // } else {
  //   console.log("dragState is NOT active");
  // }

  console.log(
    `currScrolltop: ${currScrolltop}, prevScrolltop: ${prevScrolltop}, tabListOffset: ${previousTabListOffset}, distance to "scroll" by: ${distanceToScrollBy}, thumbOffset: ${this.scrollState.thumbOffset
    }, dragState: ${Boolean(this.dragState)}`
  );

  const scrollOptions = {
    distance: distanceToScrollBy,
    scrollBarOnly: true
  };

  scroll.call(this, scrollOptions);

  // check if a tab is being dragged right now
  // if so, drag the tab to keep up with the changing scrolltop
  if (this.dragState) {
    dragTab.call(this, {
      distance: distanceToScrollBy
    });
  }
}

module.exports = onScroll;
