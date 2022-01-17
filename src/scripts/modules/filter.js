"use strict";

const util = require("./util");
const adjustMenu = require("./adjustMenu");

// in order for dragTab to work, it's first necessary to calculate offsetTops of all filtered tabs based on their offset value. It's not too hard.
// also need to keep scrollTop in mind.

// function filter() {
//   const state = this;
//   const filterState = state.filterState;
//   state.filteredOutTabs = 0;
//   const input = document.getElementById("filter-input");
//   const filter = input.value.toLowerCase();

//   // scroll to the top of the list
//   // if (filter != "")
//   const tabListContainer = document.getElementById("tab-list-container");
//   tabListContainer.scroll({
//     top: 0,
//     left: 0,
//     behavior: "smooth"
//   });

//   const hideTab = tab => {
//     tab.ariaHidden = "true";
//     tab.classList.add("tab--hidden");
//     tab.setAttribute("disabled", true);
//   };

//   const unhideTab = tab => {
//     tab.ariaHidden = "false";
//     tab.classList.remove("tab--hidden");
//     tab.setAttribute("disabled", false);
//   };

//   state.totalFilteredOutTabs = 0;
//   filterState.visibleTabs = 0;
//   let filteredOutTabs = 0;
//   let filteredInTabs = 0;

//   const tabs = [...document.getElementsByClassName("tab")];

//   // determine if tabs match the filter, and if they are currently visible
//   const tabsStatus = tabs.map(tab => {
//     const title = state.tabs[tab.id].title.toLowerCase();
//     const statusObj = {};
//     if (title.includes(filter)) {
//       statusObj.matchesFilter = true;
//     } else {
//       statusObj.matchesFilter = false;
//     }
//     // check if tab is currently visible
//     if (tab.classList.contains("tab--hidden")) {
//       statusObj.visible = false;
//     } else {
//       statusObj.visible = true;
//     }
//     return statusObj;
//   });

//   // style tabs based on whether they (or those that preceed/follow them) match the filter
//   tabs.forEach((tab, index) => {
//     tab.style.setProperty(
//       "--y-offset",
//       state.totalFilteredOutTabs * -46 + "px"
//     );

//     // if tab's title DOES NOT include filter
//     if (tabsStatus[index].matchesFilter == false) {
//       state.totalFilteredOutTabs += 1;
//       // if tab is not already hidden
//       if (tabsStatus[index].visible == true) {
//         hideTab(tab);
//         tab.classList.remove("tab--filtered");
//         filteredOutTabs += 1;
//         filterState.visibleTabs -= 1;
//       }
//     } else {
//       // if tab's title DOES include filter
//       filterState.visibleTabs += 1;
//       tab.classList.add("tab--filtered");
//       // const title = state.tabs[tab.id].title.toLowerCase();
//       // console.log(title, filteredOutTabs);
//       tab.style.setProperty(
//         "--opacity-delay",
//         filteredOutTabs > 0 ? "160ms" : "0ms"
//       );

//       if (!tab.classList.contains("tab--hidden")) {
//         // if tab is already visible
//         tab.style.setProperty("--speed", "160ms");
//         tab.style.setProperty(
//           "--delay",
//           filteredOutTabs > 0 ? "160ms" : "0ms"
//         );
//         // tab.style.setProperty("--delay", "160ms");
//       } else {
//         // if tab is hidden, UNHIDE it
//         unhideTab(tab);
//         // if there are VISIBLE TABS after current tab, it needs opacity delay in order to wait for tabs that follow to move out the way
//         // it has nothing to do with how many tabs are filtered

//         // this can be optimized by keeping record of next visible tab
//         if (
//           // filteredInTabs > 0 ||
//           filteredOutTabs > 0 ||
//           tabsStatus.slice(index).some(t => t.visible == true)
//         ) {
//           tab.style.setProperty("--opacity-delay", "160ms");
//         } else {
//           tab.style.setProperty("--opacity-delay", "0ms");
//         }
//         tab.style.setProperty("--delay", "0ms");
//         // console.log(title, filteredOutTabs);
//         tab.style.setProperty("--speed", "0ms");
//         filteredInTabs += 1;
//       }

//       tab.classList.add("tab--filtered");
//     }
//   });

//   // console.log(state.totalFilteredOutTabs);
//   util.adjustScrollbar();
//   adjustMenu.call(state);
// }
// function filter() {
//   const state = this;
//   const filterState = state.filterState;
//   state.filteredOutTabs = 0;
//   const input = document.getElementById("filter-input");
//   const filter = input.value.toLowerCase();

//   // scroll to the top of the list
//   // if (filter != "")
//   const tabListContainer = document.getElementById("tab-list-container");
//   tabListContainer.scroll({
//     top: 0,
//     left: 0,
//     behavior: "smooth"
//   });

//   const hideTab = tab => {
//     tab.ariaHidden = "true";
//     tab.classList.add("tab--hidden");
//     tab.setAttribute("disabled", true);
//   };

//   const unhideTab = tab => {
//     tab.ariaHidden = "false";
//     tab.classList.remove("tab--hidden");
//     tab.setAttribute("disabled", false);
//   };

//   state.totalFilteredOutTabs = 0;
//   filterState.visibleTabs = 0;
//   let filteredOutTabs = 0;
//   let filteredInTabs = 0;

//   const tabs = [...document.getElementsByClassName("tab")];

//   // determine if tabs match the filter, and if they are currently visible
//   // const tabsStatus = tabs.map(tab => {
//   //   const title = state.tabs[tab.id].title.toLowerCase();
//   //   const statusObj = {};
//   //   if (title.includes(filter)) {
//   //     statusObj.matchesFilter = true;
//   //   } else {
//   //     statusObj.matchesFilter = false;
//   //   }
//   //   // check if tab is currently visible
//   //   if (tab.classList.contains("tab--hidden")) {
//   //     statusObj.visible = false;
//   //   } else {
//   //     statusObj.visible = true;
//   //   }
//   //   return statusObj;
//   // });
//   const tabsStatus = tabs.reduce((a, tab) => {
//     const title = state.tabs[tab.id].title.toLowerCase();
//     const statusObj = {};
//     if (title.includes(filter)) {
//       statusObj.matchesFilter = true;
//     } else {
//       statusObj.matchesFilter = false;
//     }
//     // check if tab is currently visible
//     if (tab.classList.contains("tab--hidden")) {
//       statusObj.visible = false;
//     } else {
//       statusObj.visible = true;
//     }
//     return statusObj;
//   }, {});

//   // const visibleTabs = tabs.filter(t => {
//   //   const title = state.tabs[tab.id].title.toLowerCase();
//   // })

//   // let filteredIn = false;
//   let lastAlreadyVisibleTabIndex = 0;
//   let lastUnhiddenTabIndex = 0;

//   // style tabs based on whether they (or those that preceed/follow them) match the filter
//   tabs.forEach((tab, index) => {
//     tab.style.setProperty(
//       "--y-offset",
//       state.totalFilteredOutTabs * -46 + "px"
//     );

//     // if tab's title DOES NOT include filter
//     if (tabsStatus[index].matchesFilter == false) {
//       state.totalFilteredOutTabs += 1;
//       // if tab is not already hidden
//       if (tabsStatus[index].visible == true) {
//         hideTab(tab);
//         tab.classList.remove("tab--filtered");
//         filteredOutTabs += 1;
//         filterState.visibleTabs -= 1;
//       }
//     } else {
//       // if tab's title DOES include filter
//       filterState.visibleTabs += 1;
//       tab.classList.add("tab--filtered");
//       // const title = state.tabs[tab.id].title.toLowerCase();
//       // console.log(title, filteredOutTabs);
//       tab.style.setProperty(
//         "--opacity-delay",
//         filteredOutTabs > 0 ? "160ms" : "0ms"
//       );
//       // lastMatchedTabIndex = index;
//       // filteredIn = false;

//       if (!tab.classList.contains("tab--hidden")) {
//         // if tab is already visible
//         tab.style.setProperty("--speed", "160ms");
//         tab.style.setProperty(
//           "--delay",
//           filteredOutTabs > 0 ? "160ms" : "0ms"
//         );
//         lastAlreadyVisibleTabIndex = index;
//         // tab.style.setProperty("--delay", "160ms");
//       } else {
//         // if tab is hidden, UNHIDE it
//         unhideTab(tab);

//         // if there are VISIBLE TABS after current tab, it needs opacity delay in order to wait for tabs that follow to move out the way
//         // it has nothing to do with how many tabs are filtered

//         // this can be optimized by keeping record of next visible tab
//         if (
//           lastAlreadyVisibleTabIndex > lastUnhiddenTabIndex ||
//           // filteredInTabs > 0 ||
//           tabsStatus.slice(index).some(t => t.visible == true)
//         ) {
//           tab.style.setProperty("--opacity-delay", "160ms");
//         } else {
//           tab.style.setProperty("--opacity-delay", "0ms");
//         }
//         tab.style.setProperty("--delay", "0ms");
//         // console.log(title, filteredOutTabs);
//         tab.style.setProperty("--speed", "0ms");
//         // filteredIn = true;
//         filteredInTabs += 1;
//         // visible = false;
//         lastUnhiddenTabIndex = index;
//       }

//       tab.classList.add("tab--filtered");
//     }
//   });

//   // console.log(state.totalFilteredOutTabs);
//   util.adjustScrollbar();
//   adjustMenu.call(state);
// }

function filter() {
  const state = this;
  const filterState = state.filterState;
  state.filteredOutTabs = 0;
  const input = document.getElementById("filter-input");
  const filter = input.value.toLowerCase();

  // scroll to the top of the list
  const container = state.scrollState.container;
  container.scroll({
    top: 0,
    left: 0,
    behavior: "smooth"
  });

  const hideTab = tab => {
    tab.ariaHidden = "true";
    tab.classList.add("tab--hidden");
    tab.setAttribute("disabled", true);
  };

  const unhideTab = tab => {
    tab.ariaHidden = "false";
    tab.classList.remove("tab--hidden");
    tab.setAttribute("disabled", false);
  };

  state.totalFilteredOutTabs = 0;
  filterState.visibleTabs = 0;
  let filteredOutTabs = 0;
  let filteredInTabs = 0;

  // const tabs = [...document.getElementsByClassName("tab")];
  const tabs = state.tabs;

  // determine if tabs match the filter, and if they are currently visible
  // const tabsStatus = tabs.map(tab => {
  //   const title = state.tabs[tab.id].title.toLowerCase();
  //   const statusObj = {};
  //   if (title.includes(filter)) {
  //     statusObj.matchesFilter = true;
  //   } else {
  //     statusObj.matchesFilter = false;
  //   }
  //   // check if tab is currently visible
  //   if (tab.classList.contains("tab--hidden")) {
  //     statusObj.visible = false;
  //   } else {
  //     statusObj.visible = true;
  //   }
  //   return statusObj;
  // });
  const tabsObj = tabs.reduce(
    (a, tab, i) => {
      const title = state.tabsArr[i].title.toLowerCase();
      const statusObj = {};
      // check if tab is currently visible
      if (tab.classList.contains("tab--hidden")) {
        statusObj.visible = false;
      } else {
        statusObj.visible = true;
      }

      // check if tab matches filter
      if (title.includes(filter)) {
        statusObj.matchesFilter = true;
        a.matchedTabsVisible.push(statusObj.visible);
      } else {
        statusObj.matchesFilter = false;
      }

      a.tabs.push(statusObj);
      return a;
    },
    { tabs: [], matchedTabsVisible: [], visibleTabs: [] }
  );

  // console.log(tabsObj);

  // const visibleTabs = tabs.filter(t => {
  //   const title = state.tabs[tab.id].title.toLowerCase();
  // })

  // let filteredIn = false;
  let lastAlreadyVisibleTabIndex = 0;
  let lastUnhiddenTabIndex = 0;
  let matchedTabs = 0;
  let nextVisibleTabIndex;
  let firstHiddenTabIndex = null;
  let firstUnhiddenTabIndex = null;
  let firstAlreadyVisibleTabIndex = null;

  // style tabs based on whether they (or those that preceed/follow them) match the filter
  tabs.forEach((tab, index) => {
    // tab.classList.remove("tab--filtered");
    tab.style.setProperty(
      "--y-offset",
      state.totalFilteredOutTabs * -46 + "px"
    );

    // if tab's title DOES NOT include filter
    if (tabsObj.tabs[index].matchesFilter == false) {
      state.totalFilteredOutTabs += 1;
      // if tab is not already hidden
      if (tabsObj.tabs[index].visible == true) {
        hideTab(tab);
        if (firstHiddenTabIndex == null) {
          firstHiddenTabIndex = index;
        }
        tab.classList.remove("tab--filtered");
        filteredOutTabs += 1;
        filterState.visibleTabs -= 1;
      }
    } else {
      // if tab's title DOES include filter
      filterState.visibleTabs += 1;
      tab.classList.add("tab--filtered");

      if (!tab.classList.contains("tab--hidden")) {
        // if tab is already visible
        if (firstAlreadyVisibleTabIndex == null) {
          firstAlreadyVisibleTabIndex = index;
        }
        // make sure speed is not set to 0 so tab doesn't move instantly
        tab.style.setProperty("--speed", "160ms");
        // if there are filteredOut tabs above, wait until they fade away before moving up
        tab.style.setProperty("--delay", filteredOutTabs > 0 ? "160ms" : "0ms");
        lastAlreadyVisibleTabIndex = index;
      } else {
        // if tab is hidden, UNHIDE it
        unhideTab(tab);

        if (firstUnhiddenTabIndex == null) {
          firstUnhiddenTabIndex = index;
        }

        // if there are still visible tabs further down the list
        if (nextVisibleTabIndex != -1) {
          // if next visible tab index is less than current tab index (or if its undefined), it's no longer 'next' and needs to be updated
          if (nextVisibleTabIndex == undefined || nextVisibleTabIndex < index) {
            nextVisibleTabIndex = tabsObj.tabs
              .slice(index)
              .findIndex(t => t.visible == true);

            if (nextVisibleTabIndex != -1) {
              nextVisibleTabIndex += index;
            }
          }
        }

        // const title = state.tabs[tab.id].title.toLowerCase();
        if (
          lastAlreadyVisibleTabIndex > firstUnhiddenTabIndex ||
          lastAlreadyVisibleTabIndex > firstHiddenTabIndex ||
          nextVisibleTabIndex > index
        ) {
          tab.style.setProperty("--opacity-delay", "160ms");
        } else {
          tab.style.setProperty("--opacity-delay", "0ms");
        }
        tab.style.setProperty("--delay", "0ms");
        tab.style.setProperty("--speed", "0ms");
        // filteredIn = true;
        filteredInTabs += 1;
        // visible = false;
        lastUnhiddenTabIndex = index;
      }

      matchedTabs += 1;
      // tab.classList.add("tab--filtered");
    }
  });

  // console.log(state.totalFilteredOutTabs);
  util.adjustScrollbar.call(state);
  adjustMenu.call(state);
}

module.exports = filter;
