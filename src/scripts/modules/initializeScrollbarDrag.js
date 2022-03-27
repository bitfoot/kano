"use strict";
const onScrollbarDragPointerMove = require("./onScrollbarDragPointerMove");
const onScrollbarDragPointerUp = require("./onScrollbarDragPointerUp");

function initializeScrollbarDrag(e) {
  const state = this;
  const scrollBar = e.target;
  const pointerPos = e.pageY;
  const shiftY = null;
  // const minOffset = null;
  // const maxOffset = null;

  state.scrollState.pointerPos = pointerPos;
  scrollBar.setPointerCapture(e.pointerId);

  // state.scrollState = {
  //   pointerPos,

  // }

  scrollBar.onpointermove = onScrollbarDragPointerMove.bind(this);
  scrollBar.onpointerup = onScrollbarDragPointerUp.bind(this);
}

module.exports = initializeScrollbarDrag;
