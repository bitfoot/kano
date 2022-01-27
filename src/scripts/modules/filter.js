"use strict";

const util = require("./util");
const adjustMenu = require("./adjustMenu");

function filter() {
  const state = this;
  const filterState = state.filterState;

  // on each filter firing:
  // 1. ALL tabs will have appropriate trans-delay and opacity-delay values set, on tab class itself. They will only be applied on --hidden or --filtered class.

  // TRANS-DELAY:
  // if ANY tab(s) above are getting unhidden, trans-delay = false
  // if ALL tabs above are not affected, trans-delay = false
  // if ANY tabs above are getting hidden AND no tabs above are getting unhidden, trans-delay = true

  // OPACITY DELAY:
  // if tab is unaffected, opacity-delay = false
  // if tab is getting hidden, opacity-delay = false
  // if tab is getting unhidden, opacity-delay = true (room has to be made first)

  // general steps when filter is fired:
  // 1. Do a pass through ALL orderedTabObjects, and:
  //    a. Get info on matchesFilter
  //    b. Get info on visibility

  // ...style tabs based on updated info in orderedTabObjects

  // scroll to the top of the list
  state.scrollState.container.scroll({
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

  const tabs = state.tabs;

  const matchesFilter = title => {
    const filter = filterState.input.value.toLowerCase();
    return title.toLowerCase().includes(filter);
  };

  // determine if tabs match the filter, and if they are currently visible
  const tabsObj = tabs.reduce(
    (a, tab, i) => {
      const title = state.orderedTabObjects[i].title;
      const statusObj = {};
      // check if tab is currently visible
      if (tab.classList.contains("tab--hidden")) {
        statusObj.visible = false;
      } else {
        statusObj.visible = true;
      }

      // check if tab matches filter
      const titleMatchesFilter = matchesFilter(title);
      if (titleMatchesFilter) {
        statusObj.matchesFilter = titleMatchesFilter;
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

// function filter() {
//   const state = this;
//   const filterState = state.filterState;
//   state.filteredOutTabs = 0;
//   const input = document.getElementById("filter-input");
//   const filter = input.value.toLowerCase();

//   // scroll to the top of the list
//   const container = state.scrollState.container;
//   container.scroll({
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

//   // const tabs = [...document.getElementsByClassName("tab")];
//   const tabs = state.tabs;

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
//   const tabsObj = tabs.reduce(
//     (a, tab, i) => {
//       const title = state.orderedTabObjects[i].title.toLowerCase();
//       const statusObj = {};
//       // check if tab is currently visible
//       if (tab.classList.contains("tab--hidden")) {
//         statusObj.visible = false;
//       } else {
//         statusObj.visible = true;
//       }

//       // check if tab matches filter
//       if (title.includes(filter)) {
//         statusObj.matchesFilter = true;
//         a.matchedTabsVisible.push(statusObj.visible);
//       } else {
//         statusObj.matchesFilter = false;
//       }

//       a.tabs.push(statusObj);
//       return a;
//     },
//     { tabs: [], matchedTabsVisible: [], visibleTabs: [] }
//   );

//   // console.log(tabsObj);

//   // const visibleTabs = tabs.filter(t => {
//   //   const title = state.tabs[tab.id].title.toLowerCase();
//   // })

//   // let filteredIn = false;
//   let lastAlreadyVisibleTabIndex = 0;
//   let lastUnhiddenTabIndex = 0;
//   let matchedTabs = 0;
//   let nextVisibleTabIndex;
//   let firstHiddenTabIndex = null;
//   let firstUnhiddenTabIndex = null;
//   let firstAlreadyVisibleTabIndex = null;

//   // style tabs based on whether they (or those that preceed/follow them) match the filter
//   tabs.forEach((tab, index) => {
//     // tab.classList.remove("tab--filtered");
//     tab.style.setProperty(
//       "--y-offset",
//       state.totalFilteredOutTabs * -46 + "px"
//     );

//     // if tab's title DOES NOT include filter
//     if (tabsObj.tabs[index].matchesFilter == false) {
//       state.totalFilteredOutTabs += 1;
//       // if tab is not already hidden
//       if (tabsObj.tabs[index].visible == true) {
//         hideTab(tab);
//         if (firstHiddenTabIndex == null) {
//           firstHiddenTabIndex = index;
//         }
//         tab.classList.remove("tab--filtered");
//         filteredOutTabs += 1;
//         filterState.visibleTabs -= 1;
//       }
//     } else {
//       // if tab's title DOES include filter
//       filterState.visibleTabs += 1;
//       tab.classList.add("tab--filtered");

//       if (!tab.classList.contains("tab--hidden")) {
//         // if tab is already visible
//         if (firstAlreadyVisibleTabIndex == null) {
//           firstAlreadyVisibleTabIndex = index;
//         }
//         // make sure speed is not set to 0 so tab doesn't move instantly
//         tab.style.setProperty("--speed", "160ms");
//         // if there are filteredOut tabs above, wait until they fade away before moving up
//         tab.style.setProperty("--delay", filteredOutTabs > 0 ? "160ms" : "0ms");
//         lastAlreadyVisibleTabIndex = index;
//       } else {
//         // if tab is hidden, UNHIDE it
//         unhideTab(tab);

//         if (firstUnhiddenTabIndex == null) {
//           firstUnhiddenTabIndex = index;
//         }

//         // if there are still visible tabs further down the list
//         if (nextVisibleTabIndex != -1) {
//           // if next visible tab index is less than current tab index (or if its undefined), it's no longer 'next' and needs to be updated
//           if (nextVisibleTabIndex == undefined || nextVisibleTabIndex < index) {
//             nextVisibleTabIndex = tabsObj.tabs
//               .slice(index)
//               .findIndex(t => t.visible == true);

//             if (nextVisibleTabIndex != -1) {
//               nextVisibleTabIndex += index;
//             }
//           }
//         }

//         // const title = state.tabs[tab.id].title.toLowerCase();
//         if (
//           lastAlreadyVisibleTabIndex > firstUnhiddenTabIndex ||
//           lastAlreadyVisibleTabIndex > firstHiddenTabIndex ||
//           nextVisibleTabIndex > index
//         ) {
//           tab.style.setProperty("--opacity-delay", "160ms");
//         } else {
//           tab.style.setProperty("--opacity-delay", "0ms");
//         }
//         tab.style.setProperty("--delay", "0ms");
//         tab.style.setProperty("--speed", "0ms");
//         // filteredIn = true;
//         filteredInTabs += 1;
//         // visible = false;
//         lastUnhiddenTabIndex = index;
//       }

//       matchedTabs += 1;
//       // tab.classList.add("tab--filtered");
//     }
//   });

//   // console.log(state.totalFilteredOutTabs);
//   util.adjustScrollbar.call(state);
//   adjustMenu.call(state);
// }

module.exports = filter;
