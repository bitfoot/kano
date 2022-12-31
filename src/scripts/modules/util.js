"use strict";

function getFaviconUrl(url) {
  let faviconUrl = new URL(`chrome-extension://${chrome.runtime.id}/_favicon/`);
  faviconUrl.searchParams.append("pageUrl", url);
  faviconUrl.searchParams.append("size", "32");
  return faviconUrl.href;
}

function disableHeaderControls(options = {}) {
  const {
    disableFilter = true,
    disableCloseSelected = true,
    disableMoveToTheBottom = true,
    disableMoveToTheTop = true,
    disableCloseDuplicates = true,
    disableSelectDeselectAll = true
  } = options;
  if (disableFilter) {
    const filter = document.getElementById("filter");
    const removeFilterTextBtn = document.getElementById(
      "remove-filter-text-btn"
    );
    const filterInput = this.filterState.input;
    // const filterIsActive = filterInput.value.length > 0;
    filterInput.setAttribute("disabled", true);
    removeFilterTextBtn.setAttribute("disabled", true);
    requestAnimationFrame(() => {
      filter.classList.add("filter--disabled");
      removeFilterTextBtn.classList.add("filter__remove-text-btn--disabled");
    });
  }

  const disableButton = btn => {
    btn.setAttribute("disabled", true);
    btn.classList.add("menu-item-btn--disabled");
  };

  if (disableCloseSelected) {
    const closeSelectedBtn = document.getElementById("close-selected-btn");
    disableButton(closeSelectedBtn);
  }
  if (disableMoveToTheBottom) {
    const moveToTheBottomBtn = document.getElementById("move-to-bottom-btn");
    disableButton(moveToTheBottomBtn);
  }
  if (disableMoveToTheTop) {
    const moveToTheTopBtn = document.getElementById("move-to-top-btn");
    disableButton(moveToTheTopBtn);
  }
  if (disableCloseDuplicates) {
    const closeDuplicatesBtn = document.getElementById("close-duplicates-btn");
    disableButton(closeDuplicatesBtn);
  }
  if (disableSelectDeselectAll) {
    const selectDeselectAllBtn = document.getElementById(
      "select-deselect-all-btn"
    );
    disableButton(selectDeselectAllBtn);
  }
}

function enableHeaderControls(options = {}) {
  const {
    enableFilter = true,
    enableCloseSelected = true,
    enableMoveToTheBottom = true,
    enableMoveToTheTop = true,
    enableCloseDuplicates = true,
    enableSelectDeselectAll = true
  } = options;

  if (enableFilter) {
    const filter = document.getElementById("filter");
    const removeFilterTextBtn = document.getElementById(
      "remove-filter-text-btn"
    );
    const filterInput = this.filterState.input;
    const filterIsActive = filterInput.value.length > 0;

    requestAnimationFrame(() => {
      filterInput.removeAttribute("disabled");
      filter.classList.remove("filter--disabled");
    });
    if (filterIsActive === true) {
      removeFilterTextBtn.removeAttribute("disabled");
      requestAnimationFrame(() => {
        removeFilterTextBtn.classList.remove(
          "filter__remove-text-btn--disabled"
        );
      });
    }
  }
}

function isRequired(argName) {
  throw new Error(`${argName} is a required argument.`);
}

function easeInOutQuad(time, b, c, duration) {
  if ((time /= duration / 2) < 1) return (c / 2) * time * time + b;
  return (-c / 2) * (--time * (time - 2) - 1) + b;
}

function easeInQuad(time, b, c, duration) {
  return c * (time /= duration) * time + b;
}

function getContentHeight() {
  const tabHeight = 40;
  const margin = 6;
  const contentHeight = this.visibleTabIds.length * (tabHeight + margin);
  return contentHeight;
}

function getContainerToContentRatio() {
  const containerHeight = this.scrollState.container.offsetHeight;
  const contentHeight = getContentHeight.call(this);
  const containerToContentRatio = containerHeight / contentHeight;
  return containerToContentRatio;
}

function getScrollbarTrackSpace() {
  const margin = 6;
  const scrollbarTrackSpace =
    this.scrollState.scrollbarTrack.offsetHeight - margin;
  return scrollbarTrackSpace;
}

function getScrollbarHeight() {
  const scrollbarTrackSpace = getScrollbarTrackSpace.call(this);
  const containerToContentRatio = getContainerToContentRatio.call(this);
  const scrollbarHeight = Math.min(
    scrollbarTrackSpace,
    scrollbarTrackSpace * containerToContentRatio
  );
  return scrollbarHeight;
}

function resetTabCSSVariables(tabs) {
  tabs.forEach(tab => {
    window.requestAnimationFrame(() => {
      tab.style.setProperty("--trans-delay", "0ms");
      tab.style.setProperty("--opacity-delay", "0ms");
      tab.style.setProperty("--trans-duration", "0ms");
      tab.style.setProperty("--opacity-duration", "0ms");
      tab.style.setProperty("--scale", 1);
      tab.style.setProperty("--opacity", 1);
      tab.style.setProperty("--drag-offset", 0 + "px");
      tab.style.setProperty("--misc-offset", 0 + "px");
      // tab.style.setProperty("--backdrop-filter", "none");
      // tab.style.setProperty("", 1);
    });
  });
}

function getMaxScrollTop() {
  let contentHeight = getContentHeight.call(this);
  let maxScrollTop = contentHeight - this.scrollState.maxContainerHeight;
  if (maxScrollTop < 0) {
    maxScrollTop = 0;
  }
  return maxScrollTop;
}

// this will be called when tabs are first rendered, when a tab is deleted, and when tabs are filtered
function adjustScrollbar() {
  const container = this.scrollState.container;
  const scrollbarTrack = this.scrollState.scrollbarTrack;
  const scrollState = this.scrollState;

  const prevContainerToContentRatio = this.scrollState.containerToContentRatio;
  scrollState.containerToContentRatio = getContainerToContentRatio.call(this);

  const shouldTransformScrollbar =
    prevContainerToContentRatio !== null &&
    prevContainerToContentRatio !== this.scrollState.containerToContentRatio;

  if (scrollState.containerToContentRatio >= 1) {
    window.requestAnimationFrame(() => {
      container.classList.add("tab-list-container--no-scroll");
      container.children[0].classList.remove("tab-list--scrollable");
      scrollbarTrack.classList.add("scrollbar-track--hidden");
    });
  } else {
    window.requestAnimationFrame(() => {
      container.classList.remove("tab-list-container--no-scroll");
      container.children[0].classList.add("tab-list--scrollable");
      scrollbarTrack.classList.remove("scrollbar-track--hidden");
    });
  }

  const scrollbarThumb = scrollState.scrollbarThumb;
  let prevScrollbarHeight = scrollState.scrollbarHeight;
  scrollState.scrollbarHeight = getScrollbarHeight.call(this);
  scrollState.scrollbarTrackSpace = getScrollbarTrackSpace.call(this);
  scrollState.trackSpaceToContainerHeightRatio =
    scrollState.scrollbarTrackSpace / scrollState.maxContainerHeight;
  if (prevScrollbarHeight === null) {
    prevScrollbarHeight = scrollState.scrollbarHeight;
  }
  const scrollbarThumbChange =
    scrollState.scrollbarHeight / prevScrollbarHeight;

  scrollState.maxScrollbarThumbOffset =
    scrollState.scrollbarTrackSpace - scrollState.scrollbarHeight;
  scrollState.maxScrollTop = getMaxScrollTop.call(this);

  if (scrollState.scrollTop > scrollState.maxScrollTop) {
    scrollState.adjustingScrollbar = true;
    window.requestAnimationFrame(() => {
      scrollState.container.classList.add("tab-list-container--no-scroll");
    });

    scrollState.thumbOffset =
      scrollState.maxScrollTop * scrollState.containerToContentRatio;

    scrollState.container.scroll({
      top: scrollState.maxScrollTop,
      left: 0,
      behavior: "smooth"
    });
  } else {
    scrollState.thumbOffset =
      scrollState.scrollTop *
      scrollState.containerToContentRatio *
      scrollState.trackSpaceToContainerHeightRatio;
  }

  requestAnimationFrame(() => {
    scrollbarThumb.style.setProperty(
      "--thumb-offset",
      scrollState.thumbOffset + "px"
    );
  });

  if (shouldTransformScrollbar) {
    window.requestAnimationFrame(() => {
      scrollbarThumb.style.setProperty("--ratio", scrollbarThumbChange);
      scrollbarThumb.classList.add("scrollbar-track__thumb--transforming");
    });

    scrollbarThumb.ontransitionend = () => {
      scrollbarThumb.ontransitionend = "";
      window.requestAnimationFrame(() => {
        scrollbarThumb.classList.remove("scrollbar-track__thumb--transforming");
        scrollbarThumb.style.setProperty(
          "--thumb-height",
          scrollState.scrollbarHeight + "px"
        );
      });
    };
  } else {
    window.requestAnimationFrame(() => {
      scrollbarThumb.style.setProperty(
        "--thumb-height",
        scrollState.scrollbarHeight + "px"
      );
    });
  }
}

function createCheckboxSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  let paths = null;

  // set standard svg attributes
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("version", "1.1");
  svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute("xmlns:svgjs", "http://svgjs.com/svgjs");
  svg.setAttribute("viewbox", "0 0 28 28");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "28");
  g.setAttribute("transform", "matrix(0.833333,0,0,0.833333,4,4)");

  const createPaths = num => {
    const paths = [];
    for (let i = 0; i < num; i++) {
      paths[i] = document.createElementNS("http://www.w3.org/2000/svg", "path");
      paths[i].setAttribute("fill", "none");
      paths[i].setAttribute("stroke-linecap", "round");
      paths[i].setAttribute("stroke-linejoin", "round");
      paths[i].setAttribute("stroke-width", "1.5");
    }
    return paths;
  };

  paths = createPaths(2);
  paths[0].setAttribute(
    "d",
    "M0.75,3.412C0.75,1.941 1.942,0.749 3.413,0.749L20.587,0.749C22.058,0.749 23.25,1.941 23.25,3.412L23.25,20.586C23.25,22.057 22.058,23.249 20.587,23.249L3.413,23.249C1.942,23.249 0.75,22.057 0.75,20.586L0.75,3.412Z"
  );
  // paths[0].setAttribute("stroke", "var(--color-three)");
  paths[0].setAttribute("stroke", "var(--color-four)");
  paths[0].classList.add(`tab__svg-checkbox-box`);

  paths[1].setAttribute(
    "d",
    "M6,13.223L8.45,16.7C8.645,16.991 8.972,17.165 9.322,17.165C9.649,17.165 9.959,17.012 10.157,16.751L18,6.828"
  );
  paths[1].classList.add(`tab__svg-checkbox-checkmark`);
  paths.forEach(path => g.appendChild(path));
  svg.appendChild(g);
  svg.classList.add("tab__svg-checkbox");
  return svg;
}

function createDuplicateIndicatorSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add(`tab__duplicate-indicator`);
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  let paths = null;

  // set standard svg attributes
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("version", "1.1");
  svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute("xmlns:svgjs", "http://svgjs.com/svgjs");
  svg.setAttribute("viewbox", "0 0 20 20");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  g.setAttribute("transform", "matrix(0.833333,0,0,0.833333,0,0)");

  const createPaths = num => {
    const paths = [];
    for (let i = 0; i < num; i++) {
      paths[i] = document.createElementNS("http://www.w3.org/2000/svg", "path");
      paths[i].setAttribute("fill", "none");
      paths[i].setAttribute("stroke-linecap", "round");
      paths[i].setAttribute("stroke-linejoin", "round");
      paths[i].setAttribute("stroke-width", "1.5");
    }
    return paths;
  };

  paths = createPaths(2);
  paths[0].setAttribute(
    "d",
    "M3.75,2.507C3.75,1.534 4.538,0.746 5.511,0.746L21.489,0.746C22.462,0.746 23.25,1.534 23.25,2.507C23.25,6.213 23.25,14.779 23.25,18.485C23.25,19.458 22.462,20.246 21.489,20.246C17.614,20.246 8.423,20.246 5.034,20.246C4.325,20.246 3.75,19.671 3.75,18.962L3.75,2.507Z"
  );

  paths[1].setAttribute(
    "d",
    "M20.25,23.246C20.25,23.246 10.416,23.238 4.71,23.233C2.515,23.231 0.737,21.45 0.739,19.255C0.743,13.558 0.75,3.746 0.75,3.746"
  );

  g.append(...paths);
  svg.appendChild(g);
  return svg;
}

module.exports = {
  adjustScrollbar,
  getContainerToContentRatio,
  getContentHeight,
  createCheckboxSvg,
  getMaxScrollTop,
  createDuplicateIndicatorSvg,
  getScrollbarHeight,
  resetTabCSSVariables,
  easeInOutQuad,
  easeInQuad,
  getFaviconUrl,
  disableHeaderControls,
  enableHeaderControls
};
