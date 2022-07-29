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

  // console.log("poop");
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

  const allTabsAreHidden = this.visibleTabIds.length === 0;
  // this.visibleTabIds = [];
  // this.hiddenTabIds = [];

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
    firstHiddenTabIndex: this.filterState.firstHiddenTabIndex,
    lastUncheckedVisibleIndex: null,
    firstCheckedVisibleIndex: null,
    lastHiddenTabIndex: this.filterState.lastHiddenTabIndex,
    duplicateVisibleTabIds: []
  };

  // if (this.hiddenTabIds.length !== 0) {
  //   accumulator.firstHiddenTabIndex = this.tabIndices[this.hiddenTabIds[0]];
  //   accumulator.lastHiddenTabIndex = this.tabIndices[
  //     this.hiddenTabIds[this.hiddenTabIds.length - 1]
  //   ];
  // }

  // console.log(
  //   `firstHiddenTabIndex: ${accumulator.firstHiddenTabIndex
  //   }, lastHiddenTabIndex: ${accumulator.lastHiddenTabIndex}`
  // );
  // const menuData = this.orderedTabObjects.reduce((a, o, i) => {
  //   if (o.isVisible) {
  //     this.visibleTabIds.push(o.id);
  //     if (o.isDuplicate) {
  //       a.duplicateVisibleTabIds.push(o.id);
  //     }
  //     a.visibleIndices[o.id] = i;

  //     if (o.isChecked) {
  //       if (a.firstCheckedVisibleIndex === null) {
  //         a.firstCheckedVisibleIndex = i;
  //       }
  //       a.lastCheckedVisibleIndex = i;
  //       a.checkedVisibleTabs.push(o);
  //     } else {
  //       if (a.firstUncheckedVisibleIndex === null) {
  //         a.firstUncheckedVisibleIndex = i;
  //       }
  //       a.lastUncheckedVisibleIndex = i;
  //       a.uncheckedVisibleTabs.push(o);
  //     }
  //   } else {
  //     this.hiddenTabIds.push(o.id);
  //     a.visibleIndices[o.id] = null;
  //     a.lastHiddenTabIndex = i;
  //     if (a.firstHiddenTabIndex === null) {
  //       a.firstHiddenTabIndex = i;
  //     }
  //   }
  //   return a;
  // }, accumulator);

  const menuData = this.visibleTabIds.reduce((a, id) => {
    const indexInBrowser = this.tabIndices[id];
    const tabObject = this.orderedTabObjects[indexInBrowser];
    if (tabObject.isDuplicate) {
      a.duplicateVisibleTabIds.push(tabObject.id);
    }

    if (tabObject.isChecked) {
      if (a.firstCheckedVisibleIndex === null) {
        a.firstCheckedVisibleIndex = indexInBrowser;
      }
      a.lastCheckedVisibleIndex = indexInBrowser;
      a.checkedVisibleTabs.push(this.tabs[indexInBrowser]);
    } else {
      if (a.firstUncheckedVisibleIndex === null) {
        a.firstUncheckedVisibleIndex = indexInBrowser;
      }
      a.lastUncheckedVisibleIndex = indexInBrowser;
      a.uncheckedVisibleTabs.push(this.tabs[indexInBrowser]);
    }

    return a;
  }, accumulator);

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

  const checkedVisibleTabsExist = menuData.lastCheckedVisibleIndex !== null;
  let enableMoveToTopBtn = false;
  let enableMoveToBottomBtn = false;
  let enableCloseSelectedBtn = false;

  if (checkedVisibleTabsExist) {
    enableCloseSelectedBtn = true;

    const uncheckedVisibleTabsAboveExist =
      menuData.firstUncheckedVisibleIndex !== null &&
      menuData.firstUncheckedVisibleIndex < menuData.lastCheckedVisibleIndex;

    const hiddenTabsAboveExist =
      menuData.firstHiddenTabIndex !== null &&
      menuData.firstHiddenTabIndex < menuData.lastCheckedVisibleIndex;

    enableMoveToTopBtn = uncheckedVisibleTabsAboveExist || hiddenTabsAboveExist;

    const uncheckedVisibleTabsBelowExist =
      menuData.lastUncheckedVisibleIndex !== null &&
      menuData.lastUncheckedVisibleIndex > menuData.firstCheckedVisibleIndex;

    const hiddenTabsBelowExist =
      menuData.lastHiddenTabIndex !== null &&
      menuData.lastHiddenTabIndex > menuData.firstCheckedVisibleIndex;

    enableMoveToBottomBtn =
      uncheckedVisibleTabsBelowExist || hiddenTabsBelowExist;
  }

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
  if (enableCloseSelectedBtn) {
    enableButton(closeSelectedBtn);
  } else {
    disableButton(closeSelectedBtn);
  }
}

module.exports = adjustMenu;
