"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");

function onTabDragPointerMove(event) {
  const dragState = this.dragState;
  // let sign = null;
  if (dragState.eventType == "pointerdown") {
    dragState.pointerPosition = event.pageY;
  } else {
    if (event.code === "ArrowDown") {
      dragState.sign = 1;
    } else {
      dragState.sign = -1;
    }
  }

  const step = timestamp => {
    if (dragState.animationStart === null) {
      dragState.animationStart = timestamp;
    }

    dragState.animationElapsed = timestamp - dragState.animationStart;

    if (dragState.previousTimeStamp !== timestamp) {
      dragState.previousTimeStamp = timestamp;
      const dragDistance = dragState.getDragDistance();
      const scrollDistance = dragState.getScrollDistance();

      if (scrollDistance !== 0) {
        scroll.call(this, { distance: scrollDistance });
      }

      if (dragState.eventType === "keydown" || dragState.animation) {
        dragTab.call(this, { distance: dragDistance });
      }

      if (
        dragState.eventType === "pointerdown" &&
        scrollDistance === 0 &&
        (dragState.tabPosInList >= dragState.minTabPosInList ||
          dragState.tabPosInList <= dragState.maxTabPosInList)
      ) {
        dragState.animation = null;
      }
    }

    if (dragState.eventType === "keydown") {
      if (dragState.animationElapsed >= 220) {
        // dragState.animation = null;
        dragState.animationElapsed = 0;
        dragState.distanceDraggedViaKb = 0;
        dragState.animationStart = null;
        dragState.distanceToDrag = 0;
      }
    }

    if (dragState.animation) {
      window.requestAnimationFrame(step);
    }
  };

  if (!dragState.animation) {
    if (
      dragState.getScrollDistance() !== 0 ||
      dragState.eventType == "keydown"
    ) {
      console.log("%cshould scroll -- no animation running", "color: skyblue");
      dragState.animationElapsed = 0;
      dragState.distanceDraggedViaKb = 0;
      dragState.animationStart = null;
      dragState.distanceToDrag = 0;
      dragState.animation = window.requestAnimationFrame(step);
    } else if (dragState.eventType == "pointerdown") {
      dragTab.call(this, { distance: dragState.getDragDistance() });
    }
  }
}

module.exports = onTabDragPointerMove;
