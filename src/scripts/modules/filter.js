"use strict";

const util = require("./util");
const adjustMenu = require("./adjustMenu");

function filter() {
  const state = this;
  const filterState = state.filterState;
  const filter = filterState.input.value.toLowerCase();

  // TRANS-DELAY:
  // if ANY tab(s) above are getting unhidden, trans-delay = false
  // if ANY tabs above are getting unhidden AND any tabs above are getting hidden, trans-delay = false. However, after hidden tab reached 0 opacity, the tab should move up to occupy the empty space
  // if ALL tabs above are not affected, trans-delay = false
  // if ANY tabs above are getting hidden AND no tabs above are getting unhidden, trans-delay = true

  // OPACITY DELAY:
  // if tab is unaffected, opacity-delay = false
  // if tab is getting hidden, opacity-delay = false
  // if tab is getting unhidden, opacity-delay = true (room has to be made first) ONLY IF there are visible tabs below

  const matchesFilter = (title, filter) => {
    return title.toLowerCase().includes(filter);
  };

  const prepareFilteredTabObjects = tabObjects => {
    filterState.numOfFilteredTabs = 0;
    filterState.firstVisibleTabIndex = null;
    filterState.lastVisibleTabIndex = null;
    filterState.firstNewlyFilteredOutTabIndex = null;
    filterState.lastNewlyFilteredOutTabIndex = null;
    filterState.firstNewlyFilteredInTabIndex = null;
    filterState.lastNewlyFilteredInTabIndex = null;
    filterState.lastMatchedTabIndex = null;
    let filteredOutAbove = 0;
    // get the index of the last currently visible tab in the list, and store it in filterState
    // const getIndexOfLastVisibleTab = () => {
    //   let index = null;
    //   if (Object.keys(filterState.tabs).length == 0) {
    //     // if filterState doesn't have any tabs stored, that means tabs are not filtered and the last visible tab is just the last tab in the list
    //     index = tabObjects.length - 1;
    //   } else {
    //     // get the index of last visible tab from the previous filtered list
    //     for (let i = tabObjects.length - 1; i >= 0; i--) {
    //       if (
    //         filterState.tabs[tabObjects[i].id].isFilteredOut == false &&
    //         matchesFilter(tabObjects[i].title, filter)
    //       ) {
    //         index = filterState.tabs[tabObjects[i].id].index;
    //         break;
    //       }
    //     }
    //   }
    //   return index;
    // };

    // filterState.lastVisibleTabIndex = getIndexOfLastVisibleTab();

    tabObjects.forEach((obj, index) => {
      const filterOffset = filteredOutAbove * -46;
      const newObj = {
        index,
        isNewlyFilteredIn: false,
        isNewlyFilteredOut: false,
        isFilteredOut: false,
        filterOffset
      };

      // if tab was filtered previously, see if it's already filtered out (hidden)
      let wasFilteredOut = false;
      if (filterState.tabs[obj.id] !== undefined) {
        wasFilteredOut = filterState.tabs[obj.id].isFilteredOut;
      }

      const matches = matchesFilter(obj.title, filter);

      if (matches) {
        filterState.lastMatchedTabIndex = index;
        filterState.numOfFilteredTabs += 1;
        // if tab was previously filtered out (hidden from view)
        if (wasFilteredOut) {
          newObj.isNewlyFilteredIn = true;
          filterState.lastNewlyFilteredInTabIndex = index;
          if (filterState.firstNewlyFilteredInTabIndex === null) {
            filterState.firstNewlyFilteredInTabIndex = index;
          }
        } else {
          filterState.lastVisibleTabIndex = index;
          if (filterState.firstVisibleTabIndex === null) {
            filterState.firstVisibleTabIndex = index;
          }
        }
      } else {
        // if tab was previously visible
        newObj.isFilteredOut = true;
        filteredOutAbove += 1;
        if (!wasFilteredOut) {
          newObj.isNewlyFilteredOut = true;
          filterState.lastNewlyFilteredOutTabIndex = index;
          if (filterState.firstNewlyFilteredOutTabIndex === null) {
            filterState.firstNewlyFilteredOutTabIndex = index;
          }
        }
      }

      filterState.tabs[obj.id] = newObj;
    });
  };

  prepareFilteredTabObjects(state.orderedTabObjects);

  // scroll to the top of the list
  state.scrollState.container.scroll({
    top: 0,
    left: 0,
    behavior: "smooth"
  });

  const hideTab = tab => {
    tab.ariaHidden = "true";
    if (!tab.classList.contains("tab--filtered-out")) {
      tab.classList.add("tab--filtered-out");
    }
    if (tab.classList.contains("tab--filtered")) {
      tab.classList.remove("tab--filtered");
    }
    tab.setAttribute("disabled", true);
  };

  const unhideTab = tab => {
    tab.ariaHidden = "false";
    if (!tab.classList.contains("tab--filtered")) {
      tab.classList.add("tab--filtered");
    }
    if (tab.classList.contains("tab--filtered-out")) {
      tab.classList.remove("tab--filtered-out");
    }
    tab.setAttribute("disabled", false);
  };

  // 120ms
  const styleTabs = orderedTabObjects => {
    const getTransformDelay = tabObj => {
      let transformDelay = 0;

      if (tabObj.isNewlyFilteredOut) {
        transformDelay = 1000;
      } else if (!tabObj.isFilteredOut && !tabObj.isNewlyFilteredIn) {
        if (filterState.firstNewlyFilteredInTabIndex !== null) {
          if (filterState.lastNewlyFilteredOutTabIndex !== null) {
            if (
              filterState.firstNewlyFilteredInTabIndex < tabObj.index &&
              filterState.lastNewlyFilteredOutTabIndex > tabObj.index
            ) {
              // if tabs above are filtered in and tabs below are filtered out, delay is needed to allow filtered-out tabs below the time to reach 0 opacity
              transformDelay = 1000;
            } else if (
              filterState.firstNewlyFilteredOutTabIndex < tabObj.index
            ) {
              transformDelay = 1000;
            }
          }
        } else if (filterState.firstNewlyFilteredOutTabIndex !== null) {
          if (filterState.firstNewlyFilteredOutTabIndex < tabObj.index) {
            transformDelay = 1000;
          }
        }
      } else if (tabObj.isNewlyFilteredIn) {
        transformDelay = 0;
      }

      return transformDelay;
    };

    const getTransformDuration = tabObj => {
      let transformDuration = 1000;
      if (tabObj.isNewlyFilteredIn) {
        // if (filterState.lastVisibleTabIndex >= tabObj.index) {
        transformDuration = 0;
        // }
      }
      return transformDuration;
    };

    const getOpacityDelay = tabObj => {
      let opacityDelay = 0;

      if (tabObj.isNewlyFilteredOut) {
        // if current tab is newly filtered out (getting hidden)
        opacityDelay = 0;
      } else if (!tabObj.isFilteredOut && !tabObj.isNewlyFilteredIn) {
        // if current tab is already visible and not filtered out
        opacityDelay = 0;
      } else if (tabObj.isNewlyFilteredIn) {
        // if current tab is newly filtered in (getting unhidden)
        if (filterState.lastVisibleTabIndex !== null) {
          if (filterState.lastNewlyFilteredOutTabIndex !== null) {
            opacityDelay = 2000;
          } else if (
            filterState.lastVisibleTabIndex > tabObj.index ||
            tabObj.index !== filterState.lastNewlyFilteredInTabIndex
          ) {
            opacityDelay = 1000;
          }
          // if (filterState.lastNewlyFilteredOutTabIndex !== null) {
          //   opacityDelay = 2000;
          // } else {
          //   opacityDelay = 1000;
          // }
        } else if (filterState.lastNewlyFilteredOutTabIndex !== null) {
          opacityDelay = 1000;
        }
      }

      return opacityDelay;
    };

    orderedTabObjects.forEach((obj, index) => {
      const filteredTabObject = filterState.tabs[obj.id];
      const transformDelay = getTransformDelay(filteredTabObject);
      const opacityDelay = getOpacityDelay(filteredTabObject);
      const transformDuration = getTransformDuration(filteredTabObject);

      state.tabs[index].style.setProperty(
        "--trans-delay",
        transformDelay + "ms"
      );
      state.tabs[index].style.setProperty(
        "--opacity-delay",
        opacityDelay + "ms"
      );
      state.tabs[index].style.setProperty(
        "--trans-duration",
        transformDuration + "ms"
      );
      state.tabs[index].style.setProperty(
        "--y-offset",
        filteredTabObject.filterOffset + "px"
      );
      if (filteredTabObject.isFilteredOut) {
        hideTab(state.tabs[index]);
      } else {
        unhideTab(state.tabs[index]);
      }
    });
  };

  styleTabs(state.orderedTabObjects);

  // const tabs = state.tabs;

  // style tabs based on whether they (or those that preceed/follow them) match the filter
  // tabs.forEach((tab, index) => {
  //   // tab.classList.remove("tab--filtered");
  //   tab.style.setProperty(
  //     "--y-offset",
  //     state.totalFilteredOutTabs * -46 + "px"
  //   );

  //   // if tab's title DOES NOT include filter
  //   if (tabsObj.tabs[index].matchesFilter == false) {
  //     state.totalFilteredOutTabs += 1;
  //     // if tab is not already hidden
  //     if (tabsObj.tabs[index].visible == true) {
  //       hideTab(tab);
  //       if (firstHiddenTabIndex == null) {
  //         firstHiddenTabIndex = index;
  //       }
  //       tab.classList.remove("tab--filtered");
  //       filteredOutTabs += 1;
  //       filterState.visibleTabs -= 1;
  //     }
  //   } else {
  //     // if tab's title DOES include filter
  //     filterState.visibleTabs += 1;
  //     tab.classList.add("tab--filtered");

  //     if (!tab.classList.contains("tab--filtered-out")) {
  //       // if tab is already visible
  //       if (firstAlreadyVisibleTabIndex == null) {
  //         firstAlreadyVisibleTabIndex = index;
  //       }
  //       // make sure speed is not set to 0 so tab doesn't move instantly
  //       tab.style.setProperty("--speed", "560ms");
  //       // if there are filteredOut tabs above, wait until they fade away before moving up
  //       tab.style.setProperty("--delay", filteredOutTabs > 0 ? "560ms" : "0ms");
  //       lastAlreadyVisibleTabIndex = index;
  //     } else {
  //       // if tab is hidden, UNHIDE it
  //       unhideTab(tab);

  //       if (firstUnhiddenTabIndex == null) {
  //         firstUnhiddenTabIndex = index;
  //       }

  //       // if there are still visible tabs further down the list
  //       if (nextVisibleTabIndex != -1) {
  //         // if next visible tab index is less than current tab index (or if its undefined), it's no longer 'next' and needs to be updated
  //         if (nextVisibleTabIndex == undefined || nextVisibleTabIndex < index) {
  //           nextVisibleTabIndex = tabsObj.tabs
  //             .slice(index)
  //             .findIndex(t => t.visible == true);

  //           if (nextVisibleTabIndex != -1) {
  //             nextVisibleTabIndex += index;
  //           }
  //         }
  //       }

  //       // const title = state.tabs[tab.id].title.toLowerCase();
  //       if (
  //         lastAlreadyVisibleTabIndex > firstUnhiddenTabIndex ||
  //         lastAlreadyVisibleTabIndex > firstHiddenTabIndex ||
  //         nextVisibleTabIndex > index
  //       ) {
  //         tab.style.setProperty("--opacity-delay", "560ms");
  //       } else {
  //         tab.style.setProperty("--opacity-delay", "0ms");
  //       }
  //       tab.style.setProperty("--delay", "0ms");
  //       tab.style.setProperty("--speed", "0ms");
  //       // filteredIn = true;
  //       filteredInTabs += 1;
  //       // visible = false;
  //       lastUnhiddenTabIndex = index;
  //     }

  //     matchedTabs += 1;
  //     // tab.classList.add("tab--filtered");
  //   }
  // });

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
//     tab.classList.add("tab--filtered-out");
//     tab.setAttribute("disabled", true);
//   };

//   const unhideTab = tab => {
//     tab.ariaHidden = "false";
//     tab.classList.remove("tab--filtered-out");
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
//   //   if (tab.classList.contains("tab--filtered-out")) {
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
//       if (tab.classList.contains("tab--filtered-out")) {
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

//       if (!tab.classList.contains("tab--filtered-out")) {
//         // if tab is already visible
//         if (firstAlreadyVisibleTabIndex == null) {
//           firstAlreadyVisibleTabIndex = index;
//         }
//         // make sure speed is not set to 0 so tab doesn't move instantly
//         tab.style.setProperty("--speed", "560ms");
//         // if there are filteredOut tabs above, wait until they fade away before moving up
//         tab.style.setProperty("--delay", filteredOutTabs > 0 ? "560ms" : "0ms");
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
//           tab.style.setProperty("--opacity-delay", "560ms");
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
