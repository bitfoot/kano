"use strict";
const onScrollbarDragPointerMove = require("./onScrollbarDragPointerMove");
const onScrollbarDragPointerUp = require("./onScrollbarDragPointerUp");

function initializeScrollbarDrag(e) {
  const scrollBar = e.target;
  const pointerPos = e.pageY;
  const initialPos = this.scrollState.thumbOffset;
  const headerHeight = document.getElementById("header").offsetHeight;
  const shiftY = pointerPos - initialPos - headerHeight;
  // const maxThumbOffset = this.scrollState.maxScrollbarThumbOffset;
  // this.scrollState.pointerPos = pointerPos;
  scrollBar.setPointerCapture(e.pointerId);

  this.scrollState.thumbDragState = {
    initialPos,
    pointerPos,
    shiftY,
    scrollDistance: 0,
    scrollState: this.scrollState,
    thumbMinPosInViewport: headerHeight,
    thumbMaxPosInViewport:
      headerHeight + this.scrollState.maxScrollbarThumbOffset,
    get imaginaryTopPos() {
      return this.pointerPos - this.shiftY;
    },
    get thumbPosInViewport() {
      return headerHeight + this.scrollState.thumbOffset;
    }
  };

  scrollBar.onpointermove = onScrollbarDragPointerMove.bind(this);
  scrollBar.onpointerup = onScrollbarDragPointerUp.bind(this);
}

module.exports = initializeScrollbarDrag;
