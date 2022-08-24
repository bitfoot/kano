"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");
const easeInOutQuad = require("./util").easeInOutQuad;
const easeInQuad = require("./util").easeInQuad;

function onTabDragPointerMove(event) {
  const dragState = this.dragState;
  let sign = null;
  if (dragState.eventType == "pointerdown") {
    dragState.pointerPosition = event.pageY;
  } else {
    if (event.code === "ArrowDown") {
      sign = 1;
    } else {
      sign = -1;
    }
  }

  const getDragDistance = () => {
    if (dragState.eventType == "pointerdown") {
      let tabPosInViewport = dragState.tabPosInViewport.top;
      return dragState.imaginaryTopPos - tabPosInViewport;
    } else {
      const progress = Math.min(1, dragState.animationElapsed / 220);
      const prevDistance = dragState.distanceDraggedViaKb;
      const newDistance = easeInQuad(progress, 0, 46, 1) * sign;
      const distanceToDrag = newDistance - prevDistance;
      dragState.distanceToDrag = distanceToDrag;
      dragState.distanceDraggedViaKb = newDistance;
      console.log(
        `from getDragDistance. sign: ${sign}, progress: ${progress}, prevDistance: ${prevDistance}, newDistance: ${newDistance}`
      );
      if (progress === 1) {
        dragState.animation = null;
      }

      return distanceToDrag;
      // return dragState.distanceToDrag;
    }
  };

  const step = timestamp => {
    if (dragState.animationStart === null) {
      dragState.animationStart = timestamp;
    }

    dragState.animationElapsed = timestamp - dragState.animationStart;

    if (dragState.previousTimeStamp !== timestamp) {
      dragState.previousTimeStamp = timestamp;
      const tabMaxPosInViewport = dragState.tabMaxPosInViewport;
      const tabMinPosInViewport = dragState.tabMinPosInViewport;
      const imaginaryTopPos = dragState.imaginaryTopPos;
      const dragDistance = getDragDistance();

      console.log(
        `from step. getScrollDistance: ${dragState.getScrollDistance()}, dragDistance: ${dragDistance}`
      );

      if (dragState.getScrollDistance() !== 0) {
        scroll.call(this, { distance: dragState.getScrollDistance() });
      }

      dragTab.call(this, { distance: dragDistance });

      if (
        dragState.eventType === "pointerdown" &&
        (imaginaryTopPos >= tabMaxPosInViewport ||
          dragState.tabPosInViewport.top <= tabMinPosInViewport)
      ) {
        dragState.animation = null;
      }
    }

    if (dragState.eventType === "keydown") {
      if (dragState.animationElapsed >= 220) {
        dragState.animation = null;
      }
    }

    if (dragState.animation) {
      window.requestAnimationFrame(step);
    }

    // if (dragState.animation === null) {
    //   dragState.animationStart = null;
    //   dragState.distanceToDrag = 0;
    //   dragState.distanceDraggedViaKb = 0;
    // }
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
      dragTab.call(this, { distance: getDragDistance() });
    }
  }
}

module.exports = onTabDragPointerMove;
