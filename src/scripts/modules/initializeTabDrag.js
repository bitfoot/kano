"use strict";

import { onTabDrag } from "./onTabDrag";
import { onTabDragEnd } from "./onTabDragEnd";
import { resetTabCSSVariables } from "./util";
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
  // let lastPinnedVisibleIndex = null;
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

  const heightOfPinnedTabs = numPinnedTabs * tabRowHeight;
  const heightOfUnpinnedTabs =
    (this.visibleTabIds.length - numPinnedTabs) * tabRowHeight;
  const maxScrollTop = this.scrollState.maxScrollTop;
  const tabVisibleIndex = this.tabIndices[draggedTab.id][1];
  const tabsAbove = listedTabs.slice(0, tabVisibleIndex);
  const tabsBelow = listedTabs.slice(tabVisibleIndex + 1);
  const initialTabPos = tabsPosInfo[draggedTab.id].initialPos;
  const initialTopPosInViewport =
    initialTabPos + headerHeight - scrollState.scrollTop;
  const initialBottomPosInViewport = initialTopPosInViewport + tabHeight;
  const shiftY = pointerPosition - initialTabPos - headerHeight + scrollTop;

  const maxTabPosInList = tabIsPinned
    ? heightOfPinnedTabs - tabRowHeight
    : wholeContentHeight - tabRowHeight;
  const minTabPosInList = tabIsPinned ? 0 : heightOfPinnedTabs;
  let minTabOffsetInList;
  if (tabIsPinned === true) {
    minTabOffsetInList = initialTabPos * -1;
  } else {
    minTabOffsetInList = initialTabPos * -1 + heightOfPinnedTabs;
  }
  const maxTabOffsetInList = maxTabPosInList - initialTabPos;

  const midPoint = (tabHeight + margin) / 2;
  const defaultScrollBoundary = {
    up: 184,
    down: 420
  };

  draggedTab.firstChild.onblur = () => {
    draggedTab.firstChild.focus({ preventScroll: true });
  };

  window.requestAnimationFrame(() => {
    tabList.style.setProperty(
      "--pinned-tabs-height",
      heightOfPinnedTabs - margin + "px"
    );
    tabList.classList.add("tab-list--moving");
    draggedTab.style.setProperty("--scale", 1.01);
    draggedTab.classList.add("tab--draggable");
    draggedTab.classList.remove("tab--held-down");
  });

  if (tabIsPinned === false) {
    listedTabs.forEach((tab, index) => {
      window.requestAnimationFrame(() => {
        tab.classList.add("tab--tethered");
      });
      if (index >= numPinnedTabs && tab.id !== draggedTab.id) {
        window.requestAnimationFrame(() => {
          tab.style.setProperty("--scale", 0.99);
          tab.classList.add("tab--floating");
        });
      }
    });
  } else {
    listedTabs.forEach((tab, index) => {
      window.requestAnimationFrame(() => {
        tab.classList.add("tab--tethered");
      });
      if (index < numPinnedTabs && tab.id !== draggedTab.id) {
        window.requestAnimationFrame(() => {
          tab.style.setProperty("--scale", 0.99);
          tab.classList.add("tab--floating");
        });
      }
    });
  }

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
    eventType,
    previousTimeStamp: null,
    distanceDraggedViaKb: 0,
    tabsPosInfo,
    scrollState,
    draggedTab,
    midPoint,
    pointerPosition,
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
      let top =
        this.headerHeight +
        this.tabPosInList -
        this.scrollTop -
        this.scrollState.tabListOffset;
      const bottom = top + this.tabHeight;
      return {
        top,
        bottom
      };
    },
    maxTabListOffset: maxScrollTop,
    margin,
    tabHeight,
    shiftY,
    listedTabs,
    tabsAbove,
    tabsBelow,
    minTabPosInList,
    maxTabPosInList,
    minTabOffsetInList,
    maxTabOffsetInList,
    get currentMaxOffset() {
      const scrollOffset =
        this.scrollState.tabListOffset + this.scrollState.scrollTop;

      const maxOffset =
        tabIsPinned === false
          ? this.maxTabOffsetInList - Math.max(maxScrollTop - scrollOffset, 0)
          : this.maxTabOffsetInList -
          Math.max(maxScrollTop - heightOfUnpinnedTabs - scrollOffset, 0);

      return maxOffset;
    },
    get currentMinOffset() {
      const scrollOffset =
        this.scrollState.tabListOffset + this.scrollState.scrollTop;

      const minOffset =
        tabIsPinned === false
          ? this.minTabOffsetInList +
          Math.max(scrollOffset - heightOfPinnedTabs, 0)
          : this.minTabOffsetInList + scrollOffset;

      return minOffset;
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
        } else if (
          imaginaryBottomPos > this.scrollBoundary.down &&
          scrollOffset < this.scrollState.maxScrollTop
        ) {
          distance = (imaginaryBottomPos - this.scrollBoundary.down) / damper;
          if (scrollOffset + distance > this.scrollState.maxScrollTop) {
            distance = this.scrollState.maxScrollTop - scrollOffset;
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
    draggedTab.onpointermove = onTabDrag.bind(this);
    draggedTab.onpointerup = onTabDragEnd.bind(this);
  } else {
    draggedTab.onkeydown = e => {
      if (e.code === "ArrowDown" || e.code === "ArrowUp") {
        onTabDrag.call(this, e);
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
