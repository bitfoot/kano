"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");

// function onTabDrag(event) {
//   const dragState = this.dragState;
//   dragState.pointerPosition = event.pageY;

//   const step = () => {
//     // console.log(`tabListOffset: ${dragState.tabListOffset}`);
//     const adjustedTabPos =
//       dragState.initialPosition + dragState.tabOffset - dragState.tabListOffset;
//     const adjustedPointerPos =
//       dragState.pointerPosition -
//       dragState.headerHeight -
//       dragState.shiftY +
//       dragState.tabListScrollTop;

//     console.log(
//       `adjustedTabPos: ${adjustedTabPos}, adjustedPointerPos: ${adjustedPointerPos}`
//     );

//     const distance = (adjustedPointerPos - adjustedTabPos) / 10;
//     // const distance2 = adjustedPointerPos - adjustedTabPos;
//     // const distanceToMove = dragState.getUpdatedTabPos() - dragState.lastTabPos;

//     if (dragState.shouldScroll() != false) {
//       // console.log("%cshould scroll down", "color: skyblue");
//       console.log("%cshould scroll", "color: purple");
//       // scroll.call(this, { distance: distance + distanceToMove });
//       // dragTab.call(this, { distance: distance + distanceToMove });
//       scroll.call(this, { distance: distance });
//       dragTab.call(this, { distance: distance });
//       window.requestAnimationFrame(step);
//     } else if (
//       Math.round(adjustedTabPos) != adjustedPointerPos &&
//       dragState.animation
//     ) {
//       dragTab.call(this, { distance: distance });
//       window.requestAnimationFrame(step);
//     } else {
//       console.log("cancelling animation");
//       cancelAnimationFrame(dragState.animation);
//       dragState.animation = null;
//     }
//   };

//   if (dragState.shouldScroll() == "down") {
//     console.log("%cshould scroll down", "color: skyblue");
//     if (dragState.animation == null) {
//       dragState.animation = window.requestAnimationFrame(step);
//     }
//   } else if (dragState.shouldScroll() == "up") {
//     console.log("%cshould scroll up", "color: salmon");
//     console.log(`tabListOffset: ${dragState.tabListOffset}`);
//     if (dragState.animation == null) {
//       dragState.animation = window.requestAnimationFrame(step);
//     }
//   } else {
//     console.log("%cshould not scroll", "color: grey");
//     // dragState.getTabPos();

//     /*
//     while (dragState.pointerPosition > tabPosOnScreen + shiftY) {
//       dragTabDown
//     }
//     */
//     if (dragState.animation == null) {
//       const currentTabPos = dragState.getUpdatedTabPos();
//       // console.log(
//       //   `currentTabPos: ${currentTabPos}, lastTabPos: ${dragState.lastTabPos}`
//       // );
//       // console.log(
//       //   `currentTabPos: ${currentTabPos}, lastTabPos: ${dragState.lastTabPos}`
//       // );
//       const distanceToMove = currentTabPos - dragState.lastTabPos;
//       console.log(`distance to move: ${distanceToMove}`);
//       // console.log(currentTabPos, dragState.lastTabPos);
//       // console.log(
//       //   `current tab pos: ${currentTabPos}, last tab pos: ${dragState.lastTabPos
//       //   }`
//       // );
//       // console.log(`distance to move: ${distanceToMove}`);
//       dragTab.call(this, { distance: distanceToMove });
//       // console.log(
//       //   `max offset: ${dragState.maxTabOffsetBelow}, current offset: ${dragState.tabOffset
//       //   }`
//       // );
//     }
//   }
// }

function onTabDrag(event) {
  const dragState = this.dragState;

  const currentPointerPos = event.pageY;
  const lastPointerPos = dragState.pointerPosition;
  const pointerPosDifference = currentPointerPos - lastPointerPos;

  // every time the mouse moves, this is updated
  dragState.pointerPosition = currentPointerPos;

  const step = () => {
    // console.log(`tabListOffset: ${dragState.tabListOffset}`);
    const adjustedTabPos =
      dragState.initialPosition + dragState.tabOffset - dragState.tabListOffset;
    const adjustedPointerPos =
      dragState.pointerPosition -
      dragState.headerHeight -
      dragState.shiftY +
      dragState.tabListScrollTop;

    // console.log(`pointerPosDifference: ${pointerPosDifference}`);

    // this whole logic should be done inside shouldScroll function, not here.
    // that function should return numeric value, not strings like "down" or "up".
    const distance = adjustedPointerPos - adjustedTabPos;
    const virtualTabTop = dragState.pointerPosition - dragState.shiftY;
    const virtualTabBottom = virtualTabTop + dragState.tabHeight;
    let scrollDistance = null;
    if (virtualTabBottom > 420) {
      scrollDistance = virtualTabBottom - 420;
    } else if (virtualTabTop < 184) {
      scrollDistance = virtualTabTop - 184;
    }
    scrollDistance /= 10;

    // console.log(`pointerDistance: ${pointerDistance}`);
    // const distance2 = adjustedPointerPos - adjustedTabPos;
    // const distanceToMove = dragState.getUpdatedTabPos() - dragState.lastTabPos;

    if (dragState.shouldScroll() != false) {
      // console.log("%cshould scroll down", "color: skyblue");
      console.log("%cshould scroll", "color: purple");
      // scroll.call(this, { distance: distance + distanceToMove });
      // dragTab.call(this, { distance: distance + distanceToMove });
      scroll.call(this, { distance: scrollDistance });
      dragTab.call(this, { distance: distance });
      window.requestAnimationFrame(step);
    } else if (
      Math.round(adjustedTabPos) != adjustedPointerPos &&
      dragState.animation
    ) {
      dragTab.call(this, { distance: distance });
      window.requestAnimationFrame(step);
    } else {
      console.log("cancelling animation");
      cancelAnimationFrame(dragState.animation);
      dragState.animation = null;
    }
  };

  if (dragState.shouldScroll() == "down") {
    console.log("%cshould scroll down", "color: skyblue");
    if (dragState.animation == null) {
      dragState.animation = window.requestAnimationFrame(step);
    }
  } else if (dragState.shouldScroll() == "up") {
    console.log("%cshould scroll up", "color: salmon");
    console.log(`tabListOffset: ${dragState.tabListOffset}`);
    if (dragState.animation == null) {
      dragState.animation = window.requestAnimationFrame(step);
    }
  } else {
    console.log("%cshould not scroll", "color: grey");
    // dragState.getTabPos();

    /*
    while (dragState.pointerPosition > tabPosOnScreen + shiftY) {
      dragTabDown
    }
    */
    if (dragState.animation == null) {
      const currentTabPos = dragState.getUpdatedTabPos();
      // console.log(
      //   `currentTabPos: ${currentTabPos}, lastTabPos: ${dragState.lastTabPos}`
      // );
      // console.log(
      //   `currentTabPos: ${currentTabPos}, lastTabPos: ${dragState.lastTabPos}`
      // );
      const distanceToMove = currentTabPos - dragState.lastTabPos;
      console.log(`distance to move: ${distanceToMove}`);
      // console.log(currentTabPos, dragState.lastTabPos);
      // console.log(
      //   `current tab pos: ${currentTabPos}, last tab pos: ${dragState.lastTabPos
      //   }`
      // );
      // console.log(`distance to move: ${distanceToMove}`);
      dragTab.call(this, { distance: distanceToMove });
      // console.log(
      //   `max offset: ${dragState.maxTabOffsetBelow}, current offset: ${dragState.tabOffset
      //   }`
      // );
    }
  }
}

module.exports = onTabDrag;
