"use strict";

// rename this function to scrollBy
function scroll(options = {}) {
  const { distance = 0, scrollBarOnly = false, speed = 0 } = options;
  const dragState = this.dragState;
  const container = document.getElementById("tab-list-container");
  const scrollbarThumb = document.getElementById("scrollbar-thumb");
  const content = container.children[0];
  const margin = 6;
  const visibleContentHeight = container.offsetHeight - margin; // 500
  const entireContentHeight = content.offsetHeight - margin;
  const containerToContentRatio = visibleContentHeight / entireContentHeight;
  // const containerScrollTop = this.scrollState.scrollTop;
  const curThumbOffset = this.scrollState.thumbOffset;
  const scrollbarDistance = distance * containerToContentRatio;
  const newThumbOffset = curThumbOffset + scrollbarDistance;
  this.scrollState.thumbOffset = newThumbOffset;
  // console.log(`new thumbOffset: ${this.scrollState.thumbOffset}`);
  console.log(`containerToContentRatio: ${containerToContentRatio}`);
  // this value doesn't change no matter where thumb is. Max offset is always the same.
  // const maxScrollbarThumbOffset = this.maxScrollbarThumbOffset;
  // let currentThumbOffset = null;
  // console.log(`containerScrollTop: ${containerScrollTop}`);
  // if (dragState) {
  //   currentThumbOffset =
  //     (containerScrollTop + dragState.tabListOffset) * containerToContentRatio;
  // } else {
  //   // this.scrollState.tabListOffset = 0;
  //   currentThumbOffset = containerScrollTop * containerToContentRatio;
  // }

  // currentThumbOffset =
  //   (containerScrollTop + this.scrollState.tabListOffset) *
  //   containerToContentRatio;

  // let newThumbOffset = null;
  // if (dragState) {
  //   console.log(`FROM SCROLL FUNCTION! DragState is acive`);
  // currentThumbOffset = Math.max(
  //   0,
  //   Math.min(currentThumbOffset, maxScrollbarThumbOffset)
  // );
  // } else {
  //   console.log(`FROM SCROLL FUNCTION! DragState is NOT acive`);
  //   newThumbOffset = Math.max(
  //     0,
  //     Math.min(currentThumbOffset, maxScrollbarThumbOffset)
  //   );
  // }

  scrollbarThumb.style.setProperty("--thumb-offset", newThumbOffset + "px");

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

    this.scrollState.tabListOffset = dragState.tabListOffset;
    content.classList.add("tab-list--scroll");
    const newOffset = dragState.tabListOffset * -1;
    content.style.setProperty("--y-offset", newOffset + "px");
  }
}

module.exports = scroll;
