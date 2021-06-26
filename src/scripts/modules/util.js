"use strict";

function adjustBodyPadding() {
  // if html has a vertical scrollbar, padding-right should be adjusted on the body to avoid unsightly gap
  const tabList = document.getElementById("tab-list");
  // console.log(
  //   `list scroll height: ${tabList.scrollHeight}, list clientHeight: ${
  //   tabList.clientHeight
  //   }`
  // );
  if (tabList.scrollHeight > 554) {
    tabList.classList.add("tab-list--scroll");
  } else {
    console.log("removing scroll class");
    tabList.classList.remove("tab-list--scroll");
  }
}

function getNewDuplicateColor() {
  const state = this;
  const color = `hsl(${state.hue}, 100%, ${state.lightness}%)`;

  // update color values in state so they are different for the next duplicate
  if (this.hue <= 280) {
    this.hue += 40;
  } else if (this.lightness == 60) {
    this.hue = 0;
    this.lightness = 40;
  }

  return color;
}

function getListedTabs() {
  return [...document.getElementsByClassName("tab-list-item")] || [];
}

function calculateScrollbarHeight() {
  const container = document.getElementById("tab-list-container");
  const margin = 6;
  const visibleContentHeight = container.offsetHeight - margin; // 500
  const wholeContentHeight = container.scrollHeight - margin;
  const contentHeightRatio = visibleContentHeight / wholeContentHeight;
  const scrollbarHeight = visibleContentHeight * contentHeightRatio;
  return scrollbarHeight;
}

// this will be called when tabs are first rendered, when a tab is deleted, and when tabs are filtered
// TODO: make scrollbar length adjust based on number of filtered-out tabs
function adjustScrollbar() {
  // determine if scrollbar is needed, and if it's not then remove it
  const container = document.getElementById("tab-list-container");
  const tabs = document.getElementsByClassName("tab-list-item");
  const visibleTabsCount = [...tabs].reduce((a, t) => {
    if (!t.classList.contains("tab-list-item--hidden")) {
      a += 1;
    }
    return a;
  }, 0);
  const scrollbarTrack = document.getElementById("scrollbar-track");
  if (visibleTabsCount > 11) {
    container.classList.remove("tab-list-container--no-scroll");
    container.children[0].classList.add("tab-list--scrollable");
    scrollbarTrack.classList.remove("scrollbar-track--hidden");
  } else {
    container.classList.add("tab-list-container--no-scroll");
    container.children[0].classList.remove("tab-list--scrollable");
    scrollbarTrack.classList.add("scrollbar-track--hidden");
  }

  const margin = 6;
  const visibleContentHeight = container.offsetHeight - margin; // 500
  const wholeContentHeight = container.scrollHeight - margin;
  const hiddenContentHeight = wholeContentHeight - visibleContentHeight;
  const containerToContentRatio = visibleContentHeight / wholeContentHeight;

  // const content = container.children[0];

  const scrollbarThumb = document.getElementById("scrollbar-thumb");
  const scrollbarHeight = calculateScrollbarHeight();

  const containerScrollTop = Number.parseFloat(
    container.style.getPropertyValue("--scrolltop") || 0
  );

  // this value doesn't change no matter where thumb is. Max offset is always the same.
  this.maxScrollbarThumbOffset = hiddenContentHeight * containerToContentRatio;
  const currentThumbOffset = containerScrollTop * containerToContentRatio;

  if (currentThumbOffset > this.maxScrollbarThumbOffset) {
    const newScrollbarThumbOffset = this.maxScrollbarThumbOffset;
    scrollbarThumb.style.setProperty(
      "--thumb-offset",
      Math.min(newScrollbarThumbOffset, this.maxScrollbarThumbOffset) + "px"
    );
  }

  scrollbarThumb.style.setProperty("--thumb-height", scrollbarHeight + "px");
}

function calculateScrollSpeed() { }

function dragTab(options = {}) {
  const { distance = 0, speed = 0 } = options;
  const draggedTab = document.getElementsByClassName(
    "tab-list-item--draggable"
  )[0];
  if (draggedTab) {
    draggedTab.style.setProperty("--y-offset", distance + "px");
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
  paths[0].setAttribute("stroke", "var(--color-two)");
  paths[0].classList.add(`tab-list-item__svg-checkbox-box`);

  paths[1].setAttribute(
    "d",
    "M6,13.223L8.45,16.7C8.645,16.991 8.972,17.165 9.322,17.165C9.649,17.165 9.959,17.012 10.157,16.751L18,6.828"
  );
  paths[1].classList.add(`tab-list-item__svg-checkbox-checkmark`);
  paths.forEach(path => g.appendChild(path));
  svg.appendChild(g);
  return svg;
}

module.exports = {
  adjustBodyPadding,
  getNewDuplicateColor,
  getListedTabs,
  adjustScrollbar,
  createCheckboxSvg,
  calculateScrollbarHeight,
  scroll,
  dragTab
};
