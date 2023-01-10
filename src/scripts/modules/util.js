"use strict";

function getFaviconUrl(url) {
  let faviconUrl = new URL(`chrome-extension://${chrome.runtime.id}/_favicon/`);
  faviconUrl.searchParams.append("pageUrl", url);
  faviconUrl.searchParams.append("size", "32");
  return faviconUrl.href;
}

function disableHeaderControls() {
  const disableButton = btn => {
    window.requestAnimationFrame(() => {
      btn.setAttribute("disabled", true);
      btn.classList.add("menu-item-btn--disabled");
    });
  };

  const filter = document.getElementById("filter");
  const removeFilterTextBtn = document.getElementById("remove-filter-text-btn");
  console.log(Object.entries(this.menu.buttons));
  Object.entries(this.menu.buttons).forEach(entry => {
    const btn = entry[1].element;
    disableButton(btn);
  });

  const filterInput = this.filterState.input;
  filterInput.setAttribute("disabled", true);
  removeFilterTextBtn.setAttribute("disabled", true);
  requestAnimationFrame(() => {
    filter.classList.add("filter--disabled");
    removeFilterTextBtn.classList.add("filter__remove-text-btn--disabled");
  });
}

function enableHeaderControls() {
  const filter = document.getElementById("filter");
  const removeFilterTextBtn = document.getElementById("remove-filter-text-btn");
  const filterInput = this.filterState.input;
  const filterIsActive = filterInput.value.length > 0;

  requestAnimationFrame(() => {
    filterInput.removeAttribute("disabled");
    filter.classList.remove("filter--disabled");
  });
  if (filterIsActive === true) {
    removeFilterTextBtn.removeAttribute("disabled");
    requestAnimationFrame(() => {
      removeFilterTextBtn.classList.remove("filter__remove-text-btn--disabled");
    });
  }

  const enableButton = btn => {
    window.requestAnimationFrame(() => {
      btn.removeAttribute("disabled");
      btn.classList.remove("menu-item-btn--disabled");
    });
  };

  Object.entries(this.menu.buttons).forEach(entry => {
    if (entry[1].shouldBeEnabled === true) {
      enableButton(entry[1].element);
    }
  });
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
  return this.visibleTabIds.length * this.scrollState.tabRowHeight;
}

function getContainerToContentRatio() {
  // const containerHeight = this.scrollState.container.offsetHeight;
  const maxContainerHeight = this.scrollState.maxContainerHeight;
  const containerHeight = Math.max(
    this.scrollState.tabRowHeight,
    Math.min(
      maxContainerHeight,
      this.visibleTabIds.length * this.scrollState.tabRowHeight
    )
  );
  const contentHeight = getContentHeight.call(this);
  const containerToContentRatio = containerHeight / contentHeight;
  return containerToContentRatio;
}

function getScrollbarTrackSpace() {
  const margin = 6;
  const scrollbarTrackHeight = this.scrollState.maxContainerHeight;
  const scrollbarTrackSpace = scrollbarTrackHeight - margin;
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
      // tab.style.setProperty("--animation-delay", "0ms");
      // tab.style.setProperty("--transition-duration", "0ms");
      tab.style.setProperty("--scale", 1);
      // tab.style.setProperty("--sign", 0);
      tab.style.setProperty("--opacity", 1);
      tab.style.setProperty("--drag-offset", 0 + "px");
      tab.style.setProperty("--misc-offset", 0 + "px");
      tab.style.setProperty("--animation-iteration-count", 1);
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
  let paths = null;

  // set standard svg attributes
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("fill", "none");
  svg.setAttribute("viewbox", "0 0 24 24");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("height", "100%");
  svg.setAttribute("width", "100%");

  const createPaths = num => {
    const paths = [];
    for (let i = 0; i < num; i++) {
      paths[i] = document.createElementNS("http://www.w3.org/2000/svg", "path");
      paths[i].setAttribute("stroke", "var(--color-three)");
    }
    return paths;
  };

  paths = createPaths(2);
  paths[0].setAttribute("d", "M1.667 1.667h16.667v16.667H1.667z");
  paths[0].classList.add("tab__svg-checkbox-box");
  paths[1].setAttribute("d", "m6.042 10.625 2.916 2.5 5-6.25");
  paths[1].classList.add("tab__svg-checkbox-checkmark");

  const fragment = document.createDocumentFragment();
  paths.forEach(path => fragment.appendChild(path));
  svg.appendChild(fragment);
  svg.classList.add("tab__svg-checkbox");
  return svg;
}

export {
  adjustScrollbar,
  getContainerToContentRatio,
  getContentHeight,
  createCheckboxSvg,
  getMaxScrollTop,
  getScrollbarHeight,
  resetTabCSSVariables,
  easeInOutQuad,
  easeInQuad,
  getFaviconUrl,
  disableHeaderControls,
  enableHeaderControls
};
