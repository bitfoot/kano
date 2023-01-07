"use strict";

function scroll(options = {}) {
  const { distance = 0, scrollBarOnly = false } = options;
  const dragState = this.dragState;
  const container = this.scrollState.container;
  const tabList = container.children[0];
  const scrollbarDistance =
    distance *
    this.scrollState.trackSpaceToContainerHeightRatio *
    this.scrollState.containerToContentRatio;

  const newThumbOffset = Math.max(
    0,
    Math.min(
      this.scrollState.thumbOffset + scrollbarDistance,
      this.scrollState.maxScrollbarThumbOffset
    )
  );

  this.scrollState.thumbOffset = newThumbOffset;
  requestAnimationFrame(() => {
    this.scrollState.scrollbarThumb.style.setProperty(
      "--thumb-offset",
      newThumbOffset + "px"
    );
  });

  if (dragState || this.scrollState.thumbDragState) {
    // if scrolling using drag (from onTabDragPointerMove)
    if (!scrollBarOnly) {
      this.scrollState.tabListOffset += distance;
      this.scrollState.tabListOffset = Math.min(
        this.scrollState.tabListOffset,
        this.scrollState.maxScrollTop - this.scrollState.scrollTop
      );
      this.scrollState.tabListOffset = Math.max(
        this.scrollState.tabListOffset,
        this.scrollState.scrollTop * -1
      );
      // const newOffset = this.scrollState.tabListOffset * -1;
      window.requestAnimationFrame(() => {
        const newOffset = this.scrollState.tabListOffset * -1;
        tabList.classList.add("tab-list--scroll");
        tabList.style.setProperty("--y-offset", newOffset + "px");
      });
    } else {
      this.scrollState.tabListOffset = Math.min(
        this.scrollState.tabListOffset,
        this.scrollState.maxScrollTop - this.scrollState.scrollTop
      );
      this.scrollState.tabListOffset = Math.max(
        this.scrollState.tabListOffset,
        this.scrollState.scrollTop * -1
      );
      const newOffset = this.scrollState.tabListOffset * -1;
      window.requestAnimationFrame(() => {
        tabList.style.setProperty("--y-offset", newOffset + "px");
      });
    }
  }
}

export { scroll };
