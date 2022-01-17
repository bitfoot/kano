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

function getListedTabs() {
  return [...document.getElementsByClassName("tab")] || [];
}

function getFilteredTabs() {
  return [...document.getElementsByClassName("tab")] || [];
}

// this function should be merged with the one below
function calculateScrollbarHeight() {
  const container = document.getElementById("tab-list-container");
  const margin = 6;
  const visibleContentHeight = container.offsetHeight; // 500
  const wholeContentHeight = container.scrollHeight;
  const contentHeightRatio = visibleContentHeight / wholeContentHeight;
  const scrollbarHeight = visibleContentHeight * contentHeightRatio - margin;
  return scrollbarHeight;
}

// function get

// this will be called when tabs are first rendered, when a tab is deleted, and when tabs are filtered
// TODO: make scrollbar length adjust based on number of filtered-out tabs
function adjustScrollbar() {
  const state = this;
  // determine if scrollbar is needed, and if it's not then remove it
  const container = document.getElementById("tab-list-container");
  const tabs = document.getElementsByClassName("tab");
  const visibleTabsCount = [...tabs].reduce((a, t) => {
    if (!t.classList.contains("tab--hidden")) {
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

  const scrollTop = state.scrollState.scrollTop;

  // this value doesn't change no matter where thumb is. Max offset is always the same.
  this.maxScrollbarThumbOffset = hiddenContentHeight * containerToContentRatio;
  const currentThumbOffset = scrollTop * containerToContentRatio;

  if (currentThumbOffset > this.maxScrollbarThumbOffset) {
    const newScrollbarThumbOffset = this.maxScrollbarThumbOffset;
    scrollbarThumb.style.setProperty(
      "--thumb-offset",
      Math.min(newScrollbarThumbOffset, this.maxScrollbarThumbOffset) + "px"
    );
  }

  scrollbarThumb.style.setProperty("--thumb-height", scrollbarHeight + "px");
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
  adjustBodyPadding,
  getListedTabs,
  adjustScrollbar,
  createCheckboxSvg,
  createDuplicateIndicatorSvg,
  calculateScrollbarHeight
};
