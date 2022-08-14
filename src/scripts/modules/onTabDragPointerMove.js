"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");
const easeInOutQuad = require("./util").easeInOutQuad;

function onTabDragPointerMove(event) {
  const dragState = this.dragState;
  if (dragState.eventType == "pointerdown") {
    dragState.pointerPosition = event.pageY;
  }

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
      if (dragState.eventType == "pointerdown") {
        dragTab.call(this, { distance: getDragDistance() });
      } else {
        let sign = null;
        if (event.code === "ArrowDown") {
          sign = 1;
        } else {
          sign = -1;
        }

        const kbStep = timestamp => {
          // timestamp stores the value in milliseconds
          if (dragState.start === null) {
            dragState.start = timestamp;
          }

          // time elapsed in milliseconds
          const elapsed = timestamp - dragState.start;

          if (dragState.previousTimeStamp !== timestamp) {
            const progress = Math.min(1, elapsed / 220);
            const prevDistance = dragState.distance;
            const distance = easeInOutQuad(progress, 0, 46, 1) * sign;
            const distanceToDrag = distance - prevDistance;
            dragState.distance = distance;
            // console.log(
            //   `progress: ${progress}, distanceToDrag: ${distanceToDrag}`
            // );
            dragTab.call(this, { distance: distanceToDrag });
            if (progress === 1) {
              // dragState.done = true;
              dragState.kbDragAnimation = null;
            }
          }

          if (elapsed < 220) {
            // Stop the animation after 250ms
            dragState.previousTimeStamp = timestamp;
            if (!dragState.done) {
              window.requestAnimationFrame(kbStep);
            }
          }
        };

        if (dragState.kbDragAnimation == null) {
          dragState.done = false;
          dragState.start = null;
          dragState.distance = 0;
          dragState.kbDragAnimation = window.requestAnimationFrame(kbStep);
        }
        // if (dragState.done === true) {
        //   dragState.done = false;
        //   dragState.start = null;
        //   dragState.distance = 0;
        //   dragState.kbDragAnimation = window.requestAnimationFrame(kbStep);
        // }

        // console.log(
        //   `distanceToDrag: ${distanceToDrag}, distanceDraggedViaKb: ${dragState.distanceDraggedViaKb
        //   }`
        // );
        // dragTab.call(this, { distance: distanceToDrag });
      }
    }
  }
}

module.exports = onTabDragPointerMove;
