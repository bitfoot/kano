"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");

function onDragPointerMove(event) {
  const dragState = this.dragState;
  dragState.pointerPosition = event.pageY;

  const getDragDistance = () => {
    let tabPosInViewport = dragState.tabPosInViewport.top;
    return dragState.imaginaryTopPos - tabPosInViewport;
  };

  const step = () => {
    const tabMaxPosInViewport = dragState.tabMaxPosInViewport;
    const tabMinPosInViewport = dragState.tabMinPosInViewport;
    const imaginaryTopPos = dragState.imaginaryTopPos;
    const dragDistance = getDragDistance();

    if (dragState.getScrollDistance() !== 0 && dragState.animation) {
      console.log("%cshould scroll", "color: purple");
      scroll.call(this, { distance: dragState.getScrollDistance() });
      dragTab.call(this, { distance: dragDistance });
      window.requestAnimationFrame(step);
    } else if (
      Math.round(dragState.tabPosInViewport.top) !== imaginaryTopPos &&
      dragState.animation &&
      imaginaryTopPos < tabMaxPosInViewport &&
      dragState.tabPosInViewport.top > tabMinPosInViewport
    ) {
      console.log("%cshould NOT scroll", "color: red");
      dragTab.call(this, { distance: dragDistance });
      window.requestAnimationFrame(step);
    } else {
      console.log("cancelling animation");
      cancelAnimationFrame(dragState.animation);
      dragState.animation = null;
    }
  };

  if (!dragState.animation) {
    if (dragState.getScrollDistance() !== 0) {
      console.log("%cshould scroll -- no animation running", "color: skyblue");
      dragState.animation = window.requestAnimationFrame(step);
    } else {
      dragTab.call(this, { distance: getDragDistance() });
    }
  }
}

module.exports = onDragPointerMove;
