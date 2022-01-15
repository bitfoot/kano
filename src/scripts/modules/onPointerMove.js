"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");

function onPointerMove(event) {
  const dragState = this.dragState;

  dragState.lastPointerPos = dragState.pointerPosition;
  dragState.pointerPosition = event.pageY;

  // the EVENT here is pointer move event. THEREFORE, drag tab by the difference between last and current pointer position.
  // let drag function handle values that are too large or too small (exceeding maxOffset or minOffset).

  // const getDragDistance = () =>
  //   dragState.pointerPosition - dragState.lastPointerPos;

  const getDragDistance = () => {
    const tabPosInList = dragState.initialPosition + dragState.tabOffset;

    let tabPosInViewport =
      tabPosInList -
      dragState.scrollTop -
      dragState.tabListOffset +
      dragState.headerHeight;

    tabPosInViewport = Math.min(
      dragState.tabMaxPosInViewport,
      Math.max(dragState.tabMinPosInViewport, tabPosInViewport)
    );

    const virtualTabPos = dragState.pointerPosition - dragState.shiftY;

    return virtualTabPos - tabPosInViewport;
  };

  const step = () => {
    // const actualTabPos =
    //   dragState.initialPosition + dragState.tabOffset - dragState.tabListOffset;

    // const tabPosInList = dragState.initialPosition + dragState.tabOffset;

    // let tabPosInViewport =
    //   tabPosInList -
    //   dragState.scrollTop -
    //   dragState.tabListOffset +
    //   dragState.headerHeight;

    // // ensure the position is within min and max bounds
    // tabPosInViewport = Math.min(
    //   dragState.tabMaxPosInViewport,
    //   Math.max(dragState.tabMinPosInViewport, tabPosInViewport)
    // );
    // const actualTabPos =
    //   dragState.initialPosition + dragState.tabOffset - dragState.tabListOffset;
    // const adjustedMaxTabPos =
    //   dragState.maxTabPosition - dragState.tabListOffset;
    const tabMaxPosInViewport = dragState.tabMaxPosInViewport;
    const tabMinPosInViewport = dragState.tabMinPosInViewport;
    // const adjustedPointerPos =
    //   dragState.pointerPosition -
    //   dragState.headerHeight -
    //   dragState.shiftY +
    //   dragState.scrollTop;

    const virtualTabPos = dragState.pointerPosition - dragState.shiftY;

    // console.log(
    //   `virtualTabPos: ${virtualTabPos}, tabPosInViewport: ${tabPosInViewport}, tabMaxPosInViewport: ${tabMaxPosInViewport}`
    // );

    // tab position is updated when DRAGGING

    // the problem is that while getDragDistance() is guaranteed to not exceed maxOffset, that does not hold when you add getScrollDistance to it.
    // need to adjust this somehow so that scrollDistance is factored into max offset
    // const dragDistance = getDragDistance() + dragState.getScrollDistance();
    // const dragDistance = virtualTabPos - tabPosInViewport;
    const dragDistance = getDragDistance();

    if (dragState.getScrollDistance() != 0 && dragState.animation) {
      console.log("%cshould scroll", "color: purple");
      scroll.call(this, { distance: dragState.getScrollDistance() });
      dragTab.call(this, { distance: dragDistance });
      window.requestAnimationFrame(step);
    } else if (
      // this needs work
      Math.round(dragState.tabPosInViewport) != virtualTabPos &&
      dragState.animation &&
      virtualTabPos < tabMaxPosInViewport &&
      dragState.tabPosInViewport > tabMinPosInViewport
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
    if (dragState.getScrollDistance() != 0) {
      console.log("%cshould scroll -- no animation running", "color: skyblue");
      dragState.animation = window.requestAnimationFrame(step);
    } else {
      // console.log(
      //   `dragging from onPointerMove. lastPointerPos: ${lastPointerPos}, currentPointerPos: ${dragState.pointerPosition
      //   }`
      // );
      dragTab.call(this, { distance: getDragDistance() });
    }
  }
}

// function onPointerMove(event) {
//   const dragState = this.dragState;

//   // const currentPointerPos = event.pageY;
//   // const lastPointerPos = dragState.pointerPosition;
//   // const pointerPosDifference = currentPointerPos - lastPointerPos;

//   // every time the mouse moves, this is updated
//   dragState.pointerPosition = event.pageY;

//   // const getDragDistance = () => {

//   // }

//   const step = () => {
//     const adjustedTabPos =
//       dragState.initialPosition + dragState.tabOffset - dragState.tabListOffset;
//     const adjustedMaxTabPos =
//       dragState.maxTabPosition - dragState.tabListOffset;
//     const adjustedPointerPos =
//       dragState.pointerPosition -
//       dragState.headerHeight -
//       dragState.shiftY +
//       this.scrollState.scrollTop;

//     console.log(
//       `adjustedTabPos: ${adjustedTabPos}, adjustedPointerPos: ${adjustedPointerPos}, getUpdatedTabPos(): ${dragState.getUpdatedTabPos()}`
//     );

//     const dragDistance = adjustedPointerPos - adjustedTabPos;

//     if (dragState.getScrollDistance() && dragState.animation) {
//       console.log("%cshould scroll", "color: purple");
//       console.log(`scrolling by ${dragState.getScrollDistance()}`);
//       scroll.call(this, { distance: dragState.getScrollDistance() });
//       dragTab.call(this, { distance: dragDistance });
//       window.requestAnimationFrame(step);
//     } else if (
//       Math.round(adjustedTabPos) != adjustedPointerPos &&
//       dragState.animation &&
//       adjustedTabPos < adjustedMaxTabPos &&
//       adjustedTabPos > 0
//     ) {
//       dragTab.call(this, { distance: dragDistance });
//       window.requestAnimationFrame(step);
//     } else {
//       console.log("cancelling animation");
//       cancelAnimationFrame(dragState.animation);
//       dragState.animation = null;
//     }
//   };

//   if (!dragState.animation) {
//     if (dragState.getScrollDistance()) {
//       console.log("%cshould scroll -- no animation running", "color: skyblue");
//       dragState.animation = window.requestAnimationFrame(step);
//     } else {
//       console.log("%cshould not scroll", "color: grey");
//       const currentTabPos = dragState.getUpdatedTabPos();
//       const distanceToMove = currentTabPos - dragState.lastTabPos;
//       // console.log(`distance to move: ${distanceToMove}`);
//       dragTab.call(this, { distance: distanceToMove });
//     }
//   }
// }

module.exports = onPointerMove;
