"use strict";

/* needs to be called when:
  checking tab checkbox
  unchecking tab checkbox
  deleting tab
  calling filter
*/
function adjustMenu() {
  const disableButton = btn => {
    btn.setAttribute("disabled", true);
    btn.classList.add("menu-item-btn--disabled");
  };

  console.log("poop");
  const enableButton = btn => {
    btn.removeAttribute("disabled");
    btn.classList.remove("menu-item-btn--disabled");
  };

  // get the buttons
  // const menuButtons = [...document.getElementsByClassName(`menu-item-btn`)];
  const moveToTopBtn = document.getElementById("move-to-top-btn");
  const moveToBottomBtn = document.getElementById("move-to-bottom-btn");
  const closeSelectedBtn = document.getElementById("close-selected-btn");
  const closeDuplicatesBtn = document.getElementById("close-duplicates-btn");
  const selectDeselectAllBtn = document.getElementById(
    "select-deselect-all-btn"
  );

  const filterWasUsed = this.filterState.numOfFilteredTabs !== null;
  const allTabsAreHidden = this.filterState.numOfFilteredTabs === 0;

  /* what I need: 

  checkedVisibleTabs
  uncheckedVisibleTabs

  firstUncheckedVisibleIndex, 
  lastCheckedVisibleIndex, 
  firstHiddenTabIndex,

  lastUncheckedVisibleIndex, 
  firstCheckedVisibleIndex, 
  lastHiddenTabIndex,
  */

  const accumulator = {
    visibleIndices: {},
    checkedVisibleTabs: [],
    uncheckedVisibleTabs: [],
    firstUncheckedVisibleIndex: null,
    lastCheckedVisibleIndex: null,
    firstHiddenTabIndex: null,
    lastUncheckedVisibleIndex: null,
    firstCheckedVisibleIndex: null,
    lastHiddenTabIndex: null,
    duplicateVisibleTabIds: []
  };

  const menuData = this.orderedTabObjects.reduce((a, o, i) => {
    if (o.isVisible) {
      if (o.isDuplicate) {
        a.duplicateVisibleTabIds.push(o.id);
      }
      if (filterWasUsed) {
        a.visibleIndices[o.id] = this.filterState.tabs[o.id].filteredIndex;
      } else {
        a.visibleIndices[o.id] = i;
      }
      if (o.isChecked) {
        if (a.firstCheckedVisibleIndex === null) {
          a.firstCheckedVisibleIndex = i;
        }
        a.lastCheckedVisibleIndex = i;
        a.checkedVisibleTabs.push(o);
      } else {
        if (a.firstUncheckedVisibleIndex === null) {
          a.firstUncheckedVisibleIndex = i;
        }
        a.lastUncheckedVisibleIndex = i;
        a.uncheckedVisibleTabs.push(o);
      }
    } else {
      a.visibleIndices[o.id] = null;
      a.lastHiddenTabIndex = i;
      if (a.firstHiddenTabIndex === null) {
        a.firstHiddenTabIndex = i;
      }
    }
    return a;
  }, accumulator);

  // let visibleTabObjects = null;
  // if (filterWasUsed) {
  //   visibleTabObjects = this.orderedTabObjects.filter(
  //     tab => this.filterState.tabs[tab.id].isFilteredOut === false
  //   );
  // } else {
  //   visibleTabObjects = this.orderedTabObjects;
  // }
  // const duplicateVisibleTabObjects = visibleTabObjects.filter(
  //   tab => tab.isDuplicate
  // );

  // move up button should be enabled when:
  /* 
    if (Filter IS NOT active) {
      if unchecked tab exists above ANY of the checked tabs (best is to check against the last checked tab, so find firstUncheckedVisibleIndex and see if firstUncheckedVisibleIndex < lastCheckedVisibleIndex)
    } else if (Filter IS active):
      if any hidden OR visible unchecked tab exists above the last checked visible tab (if index of last visible checked tab < its normal index, OR if firstUncheckedVisibleIndex < lastCheckedVisibleIndex)
  */

  // move down button should be enabled when:
  /* 
    if (Filter IS NOT active) {
      if unchecked tab exists below ANY of the checked tabs (best is to check against the first checked tab, so find lastUncheckedVisibleIndex and see if lastUncheckedVisibleIndex > firstCheckedVisibleIndex)
    } else if (Filter IS active):
      if any hidden OR visible unchecked tab exists below the first checked visible tab (if index of last visible checked tab < its normal index, OR if firstUncheckedVisibleIndex < lastCheckedVisibleIndex)
  */

  const checkedVisibleTabsExist = menuData.checkedVisibleTabs.length > 0;
  const uncheckedVisibleTabsAboveExist =
    checkedVisibleTabsExist &&
    menuData.firstUncheckedVisibleIndex < menuData.lastCheckedVisibleIndex;
  const hiddenTabsAboveExist =
    checkedVisibleTabsExist &&
    menuData.firstHiddenTabIndex !== null &&
    menuData.lastCheckedVisibleIndex > menuData.firstHiddenTabIndex;

  const enableMoveToTopBtn =
    uncheckedVisibleTabsAboveExist || hiddenTabsAboveExist;

  // console.log(
  //   `lastUncheckedVisibleIndex: ${menuData.lastUncheckedVisibleIndex
  //   }, firstCheckedVisibleIndex: ${menuData.firstCheckedVisibleIndex}`
  // );
  const uncheckedVisibleTabsBelowExist =
    checkedVisibleTabsExist &&
    menuData.lastUncheckedVisibleIndex > menuData.firstCheckedVisibleIndex;
  const hiddenTabsBelowExist =
    checkedVisibleTabsExist &&
    menuData.lastHiddenTabIndex !== null &&
    menuData.lastHiddenTabIndex > menuData.firstCheckedVisibleIndex;
  const enableMoveToBottomBtn =
    uncheckedVisibleTabsBelowExist || hiddenTabsBelowExist;

  // if there are no visible tabs (when they are all filtered out), disable selectDeselectAllBtn
  if (allTabsAreHidden) {
    disableButton(selectDeselectAllBtn);
  } else {
    enableButton(selectDeselectAllBtn);
  }
  // if there are duplicate tabs visible, enable the "Close Duplicates" button
  if (menuData.duplicateVisibleTabIds.length > 0) {
    enableButton(closeDuplicatesBtn);
  } else {
    disableButton(closeDuplicatesBtn);
  }
  // if some tabs are checked, enable move & delete buttons
  if (enableMoveToTopBtn) {
    enableButton(moveToTopBtn);
  } else {
    disableButton(moveToTopBtn);
  }
  if (enableMoveToBottomBtn) {
    enableButton(moveToBottomBtn);
  } else {
    disableButton(moveToBottomBtn);
  }
}

module.exports = adjustMenu;
