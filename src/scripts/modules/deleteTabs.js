"use strict";

// const adjustMenu = require("./adjustMenu");
// const adjustScrollbar = require("./util").adjustScrollbar;
const resetTabCSSVariables = require("./util").resetTabCSSVariables;

function deleteTabs(idsOfTabsToDelete) {
  if (idsOfTabsToDelete.length === 0) return;
  const tabsToDelete = idsOfTabsToDelete.reduce((a, id) => {
    const index = this.tabIndices[id][0];
    const URL = this.orderedTabObjects[index].url;
    this.tabIdsByURL[URL] = this.tabIdsByURL[URL].filter(tabId => tabId !== id);
    if (this.tabIdsByURL[URL].length === 0) {
      delete this.tabIdsByURL[URL];
    }
    a[id] = this.tabs[index];
    return a;
  }, {});

  resetTabCSSVariables(this.tabs);
  const reorderedTabObjects = [];
  let numDeleted = 0;
  let maxChangeInPosition = 0;
  let firstHiddenTabIndex = null;
  let firstDeletedTab = null;
  let firstVisibleTabBelowDeletedTab = null;

  const finishTabDeletion = () => {
    const browserTabIds = [];
    Object.entries(tabsToDelete).forEach(entry => {
      const id = entry[0];
      const tab = entry[1];
      requestAnimationFrame(() => {
        tab.remove();
      });
      const filterWasUsed = this.filterState.numOfFilteredTabs !== null;
      if (filterWasUsed) {
        if (this.filterState.tabs[id] !== undefined) {
          this.filterState.numOfFilteredTabs -= 1;
          delete this.filterState.tabs[id];
        }
      }
      browserTabIds.push(parseInt(id.split("-")[1]));
    });
  };

  this.orderedTabObjects.forEach((obj, i) => {
    const tab = this.tabs[i];
    if (!tabsToDelete[obj.id]) {
      if (this.tabIdsByURL[obj.url].length < 2) {
        obj.isDuplicate = false;
        window.requestAnimationFrame(() => {
          tab.classList.remove("tab--duplicate");
        });
      }

      // update tab's browser index and calculate offset
      this.tabIndices[obj.id][0] = reorderedTabObjects.length;

      // if tab is not hidden, update its visible index
      if (this.tabIndices[obj.id][1] !== null) {
        if (firstVisibleTabBelowDeletedTab === null && numDeleted > 0) {
          firstVisibleTabBelowDeletedTab = tab;
        }
        const deletedOffset = numDeleted * -46;
        window.requestAnimationFrame(() => {
          tab.style.setProperty("--deleted-offset", deletedOffset + "px");
        });
        maxChangeInPosition = deletedOffset;
        this.tabIndices[obj.id][1] -= numDeleted;
      } else {
        // update lastHiddenTabIndex in filterState, in case it changed
        this.filterState.lastHiddenTabIndex = this.tabIndices[obj.id][0];
        if (firstHiddenTabIndex === null) {
          firstHiddenTabIndex = this.tabIndices[obj.id][0];
        }
      }

      reorderedTabObjects[this.tabIndices[obj.id][0]] = obj;
    } else {
      if (numDeleted === 0) {
        firstDeletedTab = tab;
      }
      numDeleted += 1;
      window.requestAnimationFrame(() => {
        tab.classList.add("tab--deleted");
        delete this.tabIndices[obj.id];
      });
    }
  });

  // update firstHiddenTabIndex, in case it changed
  this.filterState.firstHiddenTabIndex = firstHiddenTabIndex;
  // let animationDuration = 100;
  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = this.visibleTabIds.filter(id => !tabsToDelete[id]);

  const animationDuration = Math.min(
    Math.max(Math.abs(maxChangeInPosition) * 2.174, 100),
    240
  );

  if (firstVisibleTabBelowDeletedTab !== null) {
    firstVisibleTabBelowDeletedTab.onanimationend = e => {
      if (e.animationName === "belowDeleted") {
        console.log("bigpoop");
        finishTabDeletion.call(this);
      }
    };
  } else {
    firstDeletedTab.ontransitionend = e => {
      if (e.propertyName === "opacity") {
        console.log("smallpoop");
        finishTabDeletion.call(this);
      }
    };
  }

  // const timeoutDuration = 100 + animationDuration;
  window.requestAnimationFrame(() => {
    document.documentElement.style.setProperty(
      "--animation-duration",
      animationDuration + "ms"
    );
  });
  this.tabs = this.tabs.filter(tab => !tabsToDelete[tab.id]);

  const event = new Event("changenumtabs", { bubbles: true });
  this.tabList.dispatchEvent(event);
  // adjustMenu.call(this);
  // adjustScrollbar.call(this);

  // setTimeout(() => {
  //   const browserTabIds = [];
  //   Object.entries(tabsToDelete).forEach(entry => {
  //     const id = entry[0];
  //     const tab = entry[1];
  //     requestAnimationFrame(() => {
  //       tab.remove();
  //     });
  //     const filterWasUsed = this.filterState.numOfFilteredTabs !== null;
  //     if (filterWasUsed) {
  //       if (this.filterState.tabs[id] !== undefined) {
  //         this.filterState.numOfFilteredTabs -= 1;
  //         delete this.filterState.tabs[id];
  //       }
  //     }
  //     browserTabIds.push(parseInt(id.split("-")[1]));
  //   });
  // }, timeoutDuration);
}

module.exports = deleteTabs;
