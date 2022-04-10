"use strict";

const scroll = require("./scroll");

function onScrollbarDragPointerMove(e) {
  this.scrollState.thumbDragState.pointerPos = e.pageY;
  const thumbDragDistance =
    Math.min(
      Math.max(
        this.scrollState.thumbDragState.thumbMinPosInViewport,
        this.scrollState.thumbDragState.imaginaryTopPos
      ),
      this.scrollState.thumbDragState.thumbMaxPosInViewport
    ) - this.scrollState.thumbDragState.thumbPosInViewport;
  const getScrollDistance = () => {
    return thumbDragDistance / this.scrollState.containerToContentRatio;
  };
  scroll.call(this, {
    distance: getScrollDistance()
  });
}

module.exports = onScrollbarDragPointerMove;
