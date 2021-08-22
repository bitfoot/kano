"use strict";

const scroll = require("./scroll");
const dragTab = require("./dragTab");

// make it so that tab cannot be moved below the body (506 - 46) no matter how far down user's pointer is.
// After scrolling is complete, if user movespointer back up, todo won't move up until the pointer moves over it

// function onTabDrag(event) {
//   const dragState = this.dragState;
//   if (!dragState) return;
//   // pointer position is updated on every mouse move, even if animation is running
//   console.log(`pointer position inside onTabDrag: ${event.pageY}`);
//   dragState.pointerPosition = event.pageY;

//   // get

//   if (dragState.shouldScroll() == "down") {
//     // function to run every frame while scrolling down and tabListOffset has not reached maximum
//     const step = () => {
//       // dragState.getTabPos();
//       const adjustedTabPos =
//         dragState.initialPosition +
//         dragState.tabOffset -
//         dragState.tabListOffset;
//       const adjustedPointerPos =
//         dragState.pointerPosition - dragState.headerHeight - dragState.shiftY;

//       // console.log(
//       //   `adjustedTabPos: ${adjustedTabPos}, adjustedPointerPos: ${adjustedPointerPos}`
//       // );

//       const distance = (adjustedPointerPos - adjustedTabPos) / 10;

//       if (dragState.shouldScroll() == "down") {
//         console.log("%cshould scroll down", "color: skyblue");
//         dragState.tabListOffset += distance;
//         dragState.tabListOffset = Math.min(
//           dragState.tabListOffset,
//           dragState.maxTabListOffset
//         );
//         scroll.call(this, { distance: dragState.tabListOffset });
//         dragTab.call(this, { distance: distance });
//         console.log(
//           `currentTabPos: ${dragState.getUpdatedTabPos()}, lastTabPos: ${dragState.lastTabPos
//           }, pointerPos: ${dragState.pointerPosition}`
//         );
//         dragState.lastTabPos = dragState.getUpdatedTabPos();
//         window.requestAnimationFrame(step);
//       } else if (adjustedTabPos < adjustedPointerPos) {
//         dragTab.call(this, { distance: distance });
//         if (
//           adjustedTabPos <
//           dragState.maxTabPosition - dragState.tabListOffset
//         ) {
//           console.log("cancelling animation");
//           cancelAnimationFrame(dragState.animation);
//           dragState.animation = null;
//         } else {
//           window.requestAnimationFrame(step);
//         }
//         console.log(
//           `currentTabPos: ${dragState.getUpdatedTabPos()}, lastTabPos: ${dragState.lastTabPos
//           }`
//         );
//         dragState.lastTabPos = dragState.getUpdatedTabPos();
//       } else {
//         cancelAnimationFrame(dragState.animation);
//         dragState.animation = null;
//       }
//     };

//     if (dragState.animation == null) {
//       dragState.animation = window.requestAnimationFrame(step);
//     }
//   } else if (dragState.shouldScroll() == "up") {
//     console.log("%cshould scroll up", "color: salmon");
//     dragState.getTabPos();
//   } else {
//     console.log("%cshould not scroll", "color: grey");
//     dragState.getTabPos();

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
//       dragState.lastTabPos = currentTabPos;
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
  dragState.pointerPosition = event.pageY;

  // function to run every frame while scrolling down and tabListOffset has not reached maximum
  // const scrollDirection =
  const step = () => {
    const adjustedTabPos =
      dragState.initialPosition + dragState.tabOffset - dragState.tabListOffset;
    const adjustedPointerPos =
      dragState.pointerPosition -
      dragState.headerHeight -
      dragState.shiftY +
      dragState.tabListScrollTop;

    // console.log(
    //   `adjustedTabPos: ${adjustedTabPos}, adjustedPointerPos: ${adjustedPointerPos}`
    // );

    const distance = (adjustedPointerPos - adjustedTabPos) / 10;

    if (dragState.shouldScroll() == "down") {
      console.log("%cshould scroll down", "color: skyblue");
      dragState.tabListOffset += distance;
      console.log(
        `tabListOffset: ${dragState.tabListOffset
        }, maxTabListOffset: ${dragState.maxTabListOffset -
        dragState.tabListScrollTop}`
      );
      dragState.tabListOffset = Math.min(
        dragState.tabListOffset,
        dragState.maxTabListOffset
      );
      scroll.call(this, { distance: dragState.tabListOffset });
      dragTab.call(this, { distance: distance });
      // console.log(
      //   `currentTabPos: ${dragState.getUpdatedTabPos()}, lastTabPos: ${dragState.lastTabPos
      //   }, pointerPos: ${dragState.pointerPosition}`
      // );
      dragState.lastTabPos = dragState.getUpdatedTabPos();
      window.requestAnimationFrame(step);
    } else if (
      Math.round(adjustedTabPos) < adjustedPointerPos &&
      dragState.animation
    ) {
      dragTab.call(this, { distance: distance });
      dragState.lastTabPos = dragState.getUpdatedTabPos();
      window.requestAnimationFrame(step);
      dragState.lastTabPos = dragState.getUpdatedTabPos();
    } else {
      console.log("cancelling animation");
      cancelAnimationFrame(dragState.animation);
      dragState.animation = null;
    }
  };

  if (dragState.shouldScroll() == "down") {
    if (dragState.animation == null) {
      dragState.animation = window.requestAnimationFrame(step);
    }
  } else if (dragState.shouldScroll() == "up") {
    console.log("%cshould scroll up", "color: salmon");
    // dragState.getTabPos();
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
      dragState.lastTabPos = currentTabPos;
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
