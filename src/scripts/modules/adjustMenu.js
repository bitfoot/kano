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

  const enableButton = btn => {
    btn.removeAttribute("disabled");
    btn.classList.remove("menu-item-btn--disabled");
  };

  // get the buttons
  const moveToTopBtn = document.getElementById("move-to-top-btn");
  const moveToBottomBtn = document.getElementById("move-to-bottom-btn");
  const closeSelectedBtn = document.getElementById("close-selected-btn");
  const closeDuplicatesBtn = document.getElementById("close-duplicates-btn");
  const selectDeselectAllBtn = document.getElementById(
    "select-deselect-all-btn"
  );

  const allTabsAreHidden = this.visibleTabIds.length === 0;

  const accumulator = {
    checkedVisibleTabs: [],
    uncheckedVisibleTabs: [],
    firstUncheckedVisibleIndex: null,
    lastCheckedVisibleIndex: null,
    firstHiddenTabIndex: this.filterState.firstHiddenTabIndex,
    lastUncheckedVisibleIndex: null,
    firstCheckedVisibleIndex: null,
    lastHiddenTabIndex: this.filterState.lastHiddenTabIndex,
    duplicateVisibleTabIds: [],
    numChecked: 0,
    numUnchecked: 0,
    numCheckedAboveLastUnchecked: 0,
    numCheckedBelowFirstUnchecked: 0
  };

  this.menuData = this.visibleTabIds.reduce((a, id) => {
    const indexInBrowser = this.tabIndices[id][0];
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
      a.numChecked += 1;
      if (a.firstUncheckedVisibleIndex !== null) {
        a.numCheckedBelowFirstUnchecked += 1;
      }
    } else {
      if (a.firstUncheckedVisibleIndex === null) {
        a.firstUncheckedVisibleIndex = indexInBrowser;
      }
      a.lastUncheckedVisibleIndex = indexInBrowser;
      a.uncheckedVisibleTabs.push(this.tabs[indexInBrowser]);
      a.numCheckedAboveLastUnchecked = a.numChecked;
      a.numUnchecked += 1;
    }

    return a;
  }, accumulator);

  const checkedVisibleTabsExist =
    this.menuData.lastCheckedVisibleIndex !== null;
  let enableMoveToTopBtn = false;
  let enableMoveToBottomBtn = false;
  let enableCloseSelectedBtn = false;

  if (checkedVisibleTabsExist) {
    enableCloseSelectedBtn = true;

    const uncheckedVisibleTabsAboveExist =
      this.menuData.firstUncheckedVisibleIndex !== null &&
      this.menuData.firstUncheckedVisibleIndex <
      this.menuData.lastCheckedVisibleIndex;

    const hiddenTabsAboveExist =
      this.menuData.firstHiddenTabIndex !== null &&
      this.menuData.firstHiddenTabIndex < this.menuData.lastCheckedVisibleIndex;

    enableMoveToTopBtn = uncheckedVisibleTabsAboveExist || hiddenTabsAboveExist;

    const uncheckedVisibleTabsBelowExist =
      this.menuData.lastUncheckedVisibleIndex !== null &&
      this.menuData.lastUncheckedVisibleIndex >
      this.menuData.firstCheckedVisibleIndex;

    const hiddenTabsBelowExist =
      this.menuData.lastHiddenTabIndex !== null &&
      this.menuData.lastHiddenTabIndex > this.menuData.firstCheckedVisibleIndex;

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
  if (this.menuData.duplicateVisibleTabIds.length > 0) {
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
