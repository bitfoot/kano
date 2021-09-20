"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");

function onScroll(e) {
  // return;
  // console.log(e);
  // const document = e.target;
  const container = document.getElementById("tab-list-container");
  // const container = e.target;
  const prevScrolltop = this.scrollState.scrollTop;
  const currScrolltop = container.scrollTop;
  console.log("scroll event fired");
  // update scrolltop in state so that other functions get the latest value without having to use elem.scrollTop and forcing reflow
  this.scrollState.scrollTop = currScrolltop;
  let previousTabListOffset = null;
  let distanceToScrollBy = null;
  if (this.dragState) {
    previousTabListOffset = this.dragState.tabListOffset;
    distanceToScrollBy = currScrolltop - prevScrolltop;
  } else {
    previousTabListOffset = this.scrollState.tabListOffset;
    distanceToScrollBy = currScrolltop - prevScrolltop - previousTabListOffset;
  }
  this.scrollState.tabListOffset = 0;

  // let distanceToScrollBy = currScrolltop - prevScrolltop;

  // let distanceToScrollBy =
  //   currScrolltop - prevScrolltop - previousTabListOffset;

  if (this.dragState) {
    this.dragState.tabListScrollTop = currScrolltop;
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
    this.dragState &&
    this.dragState.tabListOffset + distanceToScrollBy + currScrolltop <
    this.dragState.maxScrollTop
  ) {
    console.log(
      `tabListOffset: ${this.dragState.tabListOffset}, maxScrollTop: ${this.dragState.maxScrollTop
      }`
    );
    dragTab.call(this, {
      distance: distanceToScrollBy
    });
  }
}

module.exports = onScroll;
