"use strict";

// const dragTab = require("./dragTab");

function scroll(options = {}) {
  const { distance = 0, scrollBarOnly = false, speed = 0 } = options;
  const dragState = this.dragState;
  const container = document.getElementById("tab-list-container");
  const content = container.children[0];
  const margin = 6;
  const visibleContentHeight = container.offsetHeight - margin; // 500
  const wholeContentHeight = container.scrollHeight - margin;
  const hiddenContentHeight = wholeContentHeight - visibleContentHeight;

  // const contentOffsetHeight = content.offsetHeight;
  const scrollbarThumb = document.getElementById("scrollbar-thumb");

  const containerScrollTop = this.scrollTop;
  const containerToContentRatio = visibleContentHeight / wholeContentHeight;

  // this value doesn't change no matter where thumb is. Max offset is always the same.
  const maxScrollbarThumbOffset = this.maxScrollbarThumbOffset;
  const currentThumbOffset = containerScrollTop * containerToContentRatio;

  // if (containerScrollTop == 460) {
  //   console.log(`currentThumbOffset: ${currentThumbOffset}`);
  // }

  // if (currentThumbOffset <= maxScrollbarThumbOffset) {
  const newScrollbarThumbOffset = distance * containerToContentRatio;
  scrollbarThumb.style.setProperty(
    "--thumb-offset",
    Math.min(newScrollbarThumbOffset, maxScrollbarThumbOffset) + "px"
  );
  // }

  // only offset tabList if scrolling using drag
  if (scrollBarOnly == false) {
    if (!dragState) return;

    dragState.tabListOffset += distance;

    dragState.tabListOffset = Math.min(
      dragState.tabListOffset,
      dragState.maxTabListOffset - dragState.tabListScrollTop
    );

    dragState.tabListOffset = Math.max(
      dragState.tabListScrollTop * -1,
      dragState.tabListOffset
    );

    // dragState.tabListOffset = Math.max(
    //   (dragState.tabListScrollTop - dragState.tabListOffset) * -1,
    //   Math.min(
    //     dragState.tabListOffset,
    //     dragState.maxTabListOffset - dragState.tabListScrollTop
    //   )
    // );

    console.log(
      `tabListOffset: ${dragState.tabListOffset}, maxTabListOffset: ${dragState.maxTabListOffset
      }, tabListScrollTop: ${dragState.tabListScrollTop}`
    );
    // this value is negative. equal to maxScrollTop * -1
    // const maxOffset = this.dragState.maxTabListOffset * -1;
    content.classList.add("tab-list--scroll");
    // const availableScrollDownDistance = hiddenContentHeight;

    // if (containerScrollTop < availableScrollDistance) {
    // const maxOffset = (hiddenContentHeight - containerScrollTop) * -1;
    const newOffset = dragState.tabListOffset * -1;

    content.style.setProperty("--y-offset", newOffset + "px");
    // }
  }
}

module.exports = scroll;
