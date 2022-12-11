"use strict";

// const scroll = require("./scroll");
const dragTab = require("./dragTab");

function onTabDragPointerMove(event) {
  const dragState = this.dragState;
  if (dragState.eventType == "pointerdown") {
    dragState.pointerPosition = event.pageY;
  } else {
    if (event.code === "ArrowDown") {
      dragState.sign = 1;
    } else {
      dragState.sign = -1;
    }
  }

  if (!dragState.animation) {
    if (
      dragState.getScrollDistance() !== 0 ||
      dragState.eventType == "keydown"
    ) {
      console.log("%cshould scroll -- no animation running", "color: skyblue");
      // dragState.animationElapsed = 0;
      // dragState.distanceDraggedViaKb = 0;
      // dragState.animationStart = null;
      // dragState.distanceToDrag = 0;
      dragState.animation = window.requestAnimationFrame(dragState.step);
    } else if (dragState.eventType == "pointerdown") {
      dragTab.call(this, { distance: dragState.getDragDistance() });
    }
  }
}

module.exports = onTabDragPointerMove;
