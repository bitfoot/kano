"use strict";

import { onTabDragPointerMove } from "./onTabDragPointerMove";
import { onTabDragEnd } from "./onTabDragEnd";
import { resetTabCSSVariables } from "./util";
import { getContainerHeight } from "./util";
import { disableHeaderControls } from "./util";
import { easeInOutQuad } from "./util";
import { dragTab } from "./dragTab";
import { scroll } from "./scroll";

function initializeTabDrag(event) {
  disableHeaderControls.call(this);
  const eventType = event.type;
  const draggedTab = event.target.parentElement;
  const pointerPosition = event.pageY;
  const container = this.scrollState.container;

  // disable system scrolling while tab is being dragged
  window.requestAnimationFrame(() => {
    container.classList.add("tab-list-container--no-scroll");
  });

  const tabIndex = this.tabIndices[draggedTab.id][0];
  const tabList = this.tabList;
  const scrollState = this.scrollState;
  const scrollTop = scrollState.scrollTop;
  const tabListHeight = tabList.offsetHeight;
  const headerHeight = scrollState.headerHeight;
  const tabHeight = draggedTab.offsetHeight;
  const margin = 6;
  const tabRowHeight = tabHeight + margin;
  const tabIsPinned = this.orderedTabObjects[tabIndex].isPinned;
  const listedTabs = [];
  const tabsPosInfo = {};
  let wholeContentHeight = this.visibleTabIds.length * tabRowHeight;
  let firstUnpinnedVisibleIndex = null;
  let numPinnedTabs = 0;
  for (let index = 0; index < this.visibleTabIds.length; index++) {
    const id = this.visibleTabIds[index];
    const browserIndex = this.tabIndices[id][0];
    listedTabs[index] = this.tabs[browserIndex];
    tabsPosInfo[id] = {
      initialPos: index * tabRowHeight,
      apparentOffset: 0,
      dragOffset: 0
    };
    const isPinned = this.orderedTabObjects[browserIndex].isPinned === true;
    if (isPinned) {
      numPinnedTabs += 1;
    } else if (firstUnpinnedVisibleIndex === null) {
      firstUnpinnedVisibleIndex = index;
    }
  }

  resetTabCSSVariables(listedTabs);

  const heightOfUnpinnedTabs =
    (this.visibleTabIds.length - numPinnedTabs) * tabRowHeight;
  const heightOfPinnedTabs = numPinnedTabs * tabRowHeight;
  let maxScrollTop = this.scrollState.maxScrollTop;
  /* If dragged tab is pinned, users can only drag it within the height of pinned tabs,
      and therefore the height of non-pinned off-screen tabs is irrelevant -- only 
      the height of pinned tabs matters. We therefore calculate our own "maxScrollTop" strictly 
      for the purposes of this function. */
  if (tabIsPinned) {
    maxScrollTop = heightOfPinnedTabs - this.scrollState.maxContainerHeight;
    if (maxScrollTop < 0) {
      maxScrollTop = 0;
    }
  }

  // if (tabIsPinned === false) {
  //   wholeContentHeight = this.visibleTabIds.length * tabRowHeight;
  // } else {
  //   wholeContentHeight = heightOfPinnedTabs;
  // }

  const tabVisibleIndex = this.tabIndices[draggedTab.id][1];
  const tabsAbove = listedTabs.slice(0, tabVisibleIndex);
  const tabsBelow = listedTabs.slice(tabVisibleIndex + 1);
  const initialTabPos = tabsPosInfo[draggedTab.id].initialPos;
  const containerHeight = getContainerHeight.call(this);
  const initialTopPosInViewport =
    initialTabPos + headerHeight - scrollState.scrollTop;
  const initialBottomPosInViewport = initialTopPosInViewport + tabHeight;
  const shiftY = pointerPosition - initialTabPos - headerHeight + scrollTop;
  // const maxTabPosInList = wholeContentHeight - tabRowHeight;

  const maxTabPosInList = tabIsPinned
    ? heightOfPinnedTabs - tabRowHeight
    : wholeContentHeight - tabRowHeight;
  const minTabPosInList = tabIsPinned ? 0 : heightOfPinnedTabs;
  // const minTabOffsetInList = initialTabPos * -1;
  let minTabOffsetInList;
  if (tabIsPinned === true) {
    minTabOffsetInList = initialTabPos * -1;
  } else {
    minTabOffsetInList = initialTabPos * -1 + heightOfPinnedTabs;
  }
  const maxTabOffsetInList = maxTabPosInList - initialTabPos;

  const apparentMaxTabPosInList = wholeContentHeight - tabRowHeight;
  const apparentMinTabPosInList = 0;
  const apparentMinTabOffsetInList = initialTabPos * -1;
  const apparentMaxTabOffsetInList = apparentMaxTabPosInList - initialTabPos;

  const midPoint = (tabHeight + margin) / 2;
  const defaultScrollBoundary = {
    up: 184,
    down: 420
  };

  draggedTab.firstChild.onblur = () => {
    draggedTab.firstChild.focus();
  };
  // draggedTab.setPointerCapture(event.pointerId);
  // resetTabCSSVariables(this.tabs);
  window.requestAnimationFrame(() => {
    draggedTab.style.setProperty("--scale", 1.01);
    draggedTab.classList.add("tab--draggable");
    // if (tabIsPinned) {
    //   draggedTab.classList.add("tab--tethered");
    // }
    draggedTab.classList.remove("tab--held-down");
  });

  if (tabIsPinned === false) {
    listedTabs.forEach((tab, index) => {
      if (index < numPinnedTabs) {
        window.requestAnimationFrame(() => {
          tab.classList.add("tab--tethered");
        });
      } else if (tab.id !== draggedTab.id) {
        window.requestAnimationFrame(() => {
          tab.style.setProperty("--scale", 0.99);
          tab.classList.add("tab--floating");
        });
      }
    });
  } else {
    listedTabs.slice(0, numPinnedTabs).forEach((tab, index) => {
      if (tab.id !== draggedTab.id) {
        window.requestAnimationFrame(() => {
          tab.style.setProperty("--scale", 0.99);
          tab.classList.add("tab--tethered");
          tab.classList.add("tab--floating");
        });
      } else {
        window.requestAnimationFrame(() => {
          tab.classList.add("tab--tethered");
        });
      }
    });
  }

  // listedTabs.forEach((tab, index) => {
  //   if (index < numPinnedTabs) {
  //     window.requestAnimationFrame(() => {
  //       tab.classList.add("tab--tethered");
  //     });
  //   } else if (tab.id !== draggedTab.id) {
  //     window.requestAnimationFrame(() => {
  //       tab.style.setProperty("--scale", 0.99);
  //       tab.classList.add("tab--floating");
  //     });
  //   }
  // });

  this.dragState = {
    onTabDragEnd,
    tabRowHeight,
    defaultAnimationDuration: 220,
    sign: null,
    direction: null,
    arrowKeyIsHeldDown: null,
    totalDistance: tabRowHeight,
    animationDuration: 220,
    animation: null,
    animationStart: null,
    animationElapsed: 0,
    distanceToDragInOneFrame: 0,
    elapsed: 0,
    eventType,
    start: null,
    previousTimeStamp: null,
    done: null,
    distanceDraggedViaKb: 0,
    tabsPosInfo,
    scrollState,
    scroll: false,
    apparentMaxTabPosInList,
    apparentMinTabPosInList,
    apparentMaxTabOffsetInList,
    apparentMinTabOffsetInList,
    draggedTab,
    midPoint,
    pointerPosition,
    // lastPointerPos: pointerPosition,
    get imaginaryTopPos() {
      if (this.eventType == "pointerdown") {
        return this.pointerPosition - this.shiftY;
      } else {
        return this.tabPosInViewport.top + this.distanceToDragInOneFrame;
      }
    },
    headerHeight,
    tabList,
    tabListHeight,
    tabListContainer: container,
    scrollTop,
    initialTabPos,
    initialPosInViewport: {
      top: initialTopPosInViewport,
      bottom: initialBottomPosInViewport
    },
    defaultScrollBoundary,
    scrollBoundary: {
      up: defaultScrollBoundary.up,
      down: defaultScrollBoundary.down
    },

    get tabPosInList() {
      return this.initialTabPos + this.tabsPosInfo[draggedTab.id].dragOffset;
    },

    get tabPosInViewport() {
      // let top =
      //   this.headerHeight +
      //   this.tabPosInList -
      //   this.scrollTop -
      //   this.scrollState.tabListOffset;
      let top =
        this.headerHeight +
        this.initialTabPos +
        this.tabsPosInfo[draggedTab.id].apparentOffset -
        this.scrollTop -
        this.scrollState.tabListOffset;
      const bottom = top + this.tabHeight;
      return {
        top,
        bottom
      };
    },
    // tabListOffset,
    maxTabListOffset: maxScrollTop,
    margin,
    tabHeight,
    shiftY,
    listedTabs,
    tabsAbove,
    tabsBelow,
    tabMinPosInViewport: headerHeight,
    minTabPosInList,
    maxTabPosInList,
    minTabOffsetInList,
    maxTabOffsetInList,
    get currentMaxOffset() {
      const scrollOffset =
        this.scrollState.tabListOffset + this.scrollState.scrollTop;
      // const apparentMaxOffset =
      //   this.apparentMaxTabOffsetInList -
      //   this.scrollState.maxScrollTop +
      //   scrollOffset;
      const apparentMaxOffset =
        this.apparentMaxTabOffsetInList -
        this.scrollState.maxScrollTop +
        scrollOffset;
      // const apparentMaxOffset =
      //   this.apparentMaxTabPosInList -
      //   this.tabsPosInfo[draggedTab.id].initialPos +
      //   this.tabsPosInfo[draggedTab.id].apparentOffset +
      //   this.scrollState.maxScrollTop -
      //   scrollOffset;
      const actualMaxOffset =
        this.maxTabOffsetInList - Math.max(maxScrollTop - scrollOffset, 0);
      // const actualMaxOffset =
      //   this.maxTabOffsetInList - maxScrollTop - scrollOffset;

      console.log(
        `apparentMaxOffset: ${apparentMaxOffset}, actualMaxOffset: ${actualMaxOffset}`
      );
      return {
        actual: actualMaxOffset,
        apparent: apparentMaxOffset
      };
    },
    get currentMinOffset() {
      const scrollOffset =
        this.scrollState.tabListOffset + this.scrollState.scrollTop;
      const apparentMinOffset = this.apparentMinTabOffsetInList + scrollOffset;
      const actualMinOffset =
        tabIsPinned === true
          ? this.minTabOffsetInList - Math.max(maxScrollTop - scrollOffset, 0)
          : this.minTabOffsetInList +
          Math.max(scrollOffset - heightOfPinnedTabs, 0);
      // const actualMinOffset =
      //   this.minTabOffsetInList - Math.max(maxScrollTop - scrollOffset, 0);
      // console.log(
      //   `apparentMinOffset: ${apparentMinOffset}, actualMinOffset: ${actualMinOffset}`
      // );
      return {
        actual: actualMinOffset,
        apparent: apparentMinOffset
      };
    },
    getScrollDistance() {
      const imaginaryTopPos = this.imaginaryTopPos;
      const imaginaryBottomPos = imaginaryTopPos + this.tabHeight;

      const updateScrollBoundary = () => {
        const initialTopPosInViewport = this.initialPosInViewport.top;
        const initialBottomPosInViewport = this.initialPosInViewport.bottom;
        const defaultUpScrollBoundary = this.defaultScrollBoundary.up;
        const defaultDownScrollBoundary = this.defaultScrollBoundary.down;

        if (initialTopPosInViewport < defaultUpScrollBoundary) {
          if (
            imaginaryTopPos < defaultUpScrollBoundary &&
            imaginaryTopPos > this.scrollBoundary.up
          ) {
            this.scrollBoundary.up = imaginaryTopPos;
          } else if (this.scrollBoundary.up == defaultUpScrollBoundary) {
            this.scrollBoundary.up = initialTopPosInViewport;
          }
        } else if (initialBottomPosInViewport > defaultDownScrollBoundary) {
          if (
            imaginaryBottomPos > defaultDownScrollBoundary &&
            imaginaryBottomPos < this.scrollBoundary.down
          ) {
            this.scrollBoundary.down = imaginaryBottomPos;
          } else if (this.scrollBoundary.down == defaultDownScrollBoundary) {
            this.scrollBoundary.down = initialBottomPosInViewport;
          }
        }
      };

      updateScrollBoundary();

      const getDistance = () => {
        let distance = 0;
        const damper = eventType === "pointerdown" ? 12 : 1;
        const scrollOffset =
          this.scrollState.scrollTop + this.scrollState.tabListOffset;
        if (imaginaryTopPos < this.scrollBoundary.up && scrollOffset > 0) {
          distance = (imaginaryTopPos - this.scrollBoundary.up) / damper;

          // if (scrollOffset + distance < minTabPosInList) {
          //   distance = (scrollOffset - minTabPosInList) * -1;
          // }
        } else if (
          imaginaryBottomPos > this.scrollBoundary.down &&
          scrollOffset < this.scrollState.maxScrollTop
        ) {
          distance = (imaginaryBottomPos - this.scrollBoundary.down) / damper;
          if (scrollOffset + distance > this.scrollState.maxScrollTop) {
            distance = this.scrollState.maxScrollTop - scrollOffset;
            // maxScrollTop - scrollOffset;
          }
        }
        return distance;
      };

      return getDistance();
    },
    getDragDistance() {
      let dragDistance;
      if (this.eventType === "pointerdown") {
        let tabPosInViewport = this.tabPosInViewport.top;
        dragDistance = this.imaginaryTopPos - tabPosInViewport;
      } else {
        const prevSign = this.sign;
        this.sign = this.direction === "down" ? 1 : -1;
        let progress = Math.min(
          1,
          this.animationElapsed / this.animationDuration
        );
        let prevDistance = this.distanceDraggedViaKb;
        // if sign changed, then:
        if (prevSign !== null && prevSign !== this.sign) {
          this.animationStart = null;
          this.animationElapsed = 0;
          progress = 0;
          prevDistance = 0;
          const currentPos = this.tabPosInList;
          let desiredPos;
          let desiredIndex;
          if (this.direction === "down") {
            desiredIndex = Math.ceil(currentPos / this.tabRowHeight);
            desiredPos = desiredIndex * this.tabRowHeight;
            this.totalDistance = desiredPos - currentPos;
          } else {
            desiredIndex = Math.floor(currentPos / this.tabRowHeight);
            desiredPos = desiredIndex * this.tabRowHeight;
            this.totalDistance = currentPos - desiredPos;
          }
          this.animationDuration =
            (this.totalDistance / this.tabRowHeight) *
            this.defaultAnimationDuration;
        }

        this.distanceDraggedViaKb =
          easeInOutQuad(progress, 0, this.totalDistance, 1) * this.sign;
        this.distanceToDragInOneFrame =
          this.distanceDraggedViaKb - prevDistance;
        dragDistance = this.distanceToDragInOneFrame;
      }
      return dragDistance;
    },
    step: function (timestamp) {
      if (this.dragState === null) return;
      if (this.dragState.animationStart === null) {
        this.dragState.animationStart = timestamp;
      }

      if (this.dragState.previousTimeStamp !== timestamp) {
        this.dragState.animationElapsed =
          timestamp - this.dragState.animationStart;

        this.dragState.previousTimeStamp = timestamp;
        const dragDistance = this.dragState.getDragDistance();
        const scrollDistance = this.dragState.getScrollDistance();

        if (scrollDistance !== 0) {
          scroll.call(this, { distance: scrollDistance });
        }

        if (
          this.dragState.eventType === "keydown" ||
          this.dragState.animation
        ) {
          dragTab.call(this, { distance: dragDistance });
        }

        if (
          this.dragState.eventType === "pointerdown" &&
          scrollDistance === 0 &&
          (this.dragState.tabPosInList >= this.dragState.minTabPosInList ||
            this.dragState.tabPosInList <= this.dragState.maxTabPosInList)
        ) {
          this.dragState.animation = null;
        }
      }

      if (this.dragState.eventType === "keydown") {
        if (
          this.dragState.animationElapsed >= this.dragState.animationDuration
        ) {
          this.dragState.animationElapsed = 0;
          this.dragState.distanceDraggedViaKb = 0;
          this.dragState.animationStart = null;
          this.dragState.distanceToDragInOneFrame = 0;
          this.dragState.totalDistance = this.dragState.tabRowHeight;
          this.dragState.animationDuration = this.dragState.defaultAnimationDuration;

          if (this.dragState.arrowKeyIsHeldDown === false) {
            this.dragState.animation = null;
          }
        }
      }

      if (this.dragState.animation) {
        window.requestAnimationFrame(this.dragState.step);
      }
    }.bind(this)
  };

  if (eventType == "pointerdown") {
    draggedTab.onpointermove = onTabDragPointerMove.bind(this);
    draggedTab.onpointerup = onTabDragEnd.bind(this);
  } else {
    draggedTab.onkeydown = e => {
      if (e.code === "ArrowDown" || e.code === "ArrowUp") {
        onTabDragPointerMove.call(this, e);
      }
    };
    draggedTab.onkeyup = e => {
      if (e.code === "Space" || e.code === "Enter") {
        onTabDragEnd.call(this);
      } else if (e.code === "ArrowDown" || e.code === "ArrowUp") {
        this.dragState.arrowKeyIsHeldDown = false;
      }
    };
  }
}

export { initializeTabDrag };
