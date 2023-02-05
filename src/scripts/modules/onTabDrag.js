"use strict";

import { dragTab } from "./dragTab";

function onTabDrag(event) {
  const dragState = this.dragState;
  if (dragState.eventType == "pointerdown") {
    dragState.pointerPosition = event.pageY;
  } else {
    dragState.arrowKeyIsHeldDown = true;
    if (event.code === "ArrowDown") {
      dragState.direction = "down";
    } else {
      dragState.direction = "up";
    }
  }

  if (!dragState.animation) {
    if (
      dragState.getScrollDistance() !== 0 ||
      dragState.eventType === "keydown"
    ) {
      dragState.animation = window.requestAnimationFrame(dragState.step);
    } else if (dragState.eventType == "pointerdown") {
      dragTab.call(this, { distance: dragState.getDragDistance() });
    }
  }
}

export { onTabDrag };
