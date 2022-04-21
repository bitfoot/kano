"use strict";

/* needs to be called when:
  checking tab checkbox
  unchecking tab checkbox
  deleting tab
  calling filter
*/
function adjustMenu() {
  // const state = this;
  // const filterIsActive = state.filterIsActive;

  const disableButton = btn => {
    btn.setAttribute("disabled", true);
    btn.classList.add("menu-item-btn--disabled");
  };

  const enableButton = btn => {
    btn.removeAttribute("disabled");
    btn.classList.remove("menu-item-btn--disabled");
  };

  // get the buttons
  const menuButtons = [...document.getElementsByClassName(`menu-item-btn`)];
  const moveToTopBtn = document.getElementById("move-to-top-btn");
  const moveToBottomBtn = document.getElementById("move-to-bottom-btn");
  const closeSeletedBtn = document.getElementById("close-selected-btn");
  const closeDuplicatesBtn = document.getElementById("close-duplicates-btn");
  const selectDeselectAllBtn = document.getElementById(
    "select-deselect-all-btn"
  );

  const allTabsAreHidden = this.filterState.numOfFilteredTabs === 0;
  const filterWasUsed = this.filterState.numOfFilteredTabs !== null;
  let visibleTabObjects = null;
  let duplicateVisibleTabObjects = null;
  if (filterWasUsed) {
    visibleTabObjects = this.orderedTabObjects.filter(
      tab => this.filterState.tabs[tab.id].isFilteredOut === false
    );
  } else {
    visibleTabObjects = this.orderedTabObjects;
  }
  duplicateVisibleTabObjects = visibleTabObjects.filter(tab => tab.isDuplicate);
  const duplicateTabObjects = this.orderedTabObjects.filter(
    tab => tab.isDuplicate
  );
  const checkedTabObjects = this.orderedTabObjects.filter(tab => tab.isChecked);
  // console.log(duplicateVisibleTabObjects);

  // if there are no visible tabs (when they are all filtered out), disable selectDeselectAllBtn
  if (allTabsAreHidden) {
    disableButton(selectDeselectAllBtn);
  } else {
    enableButton(selectDeselectAllBtn);
  }
  // if there are duplicate tabs, enable the "Close Duplicates" button
  if (duplicateVisibleTabObjects.length > 0) {
    enableButton(closeDuplicatesBtn);
  } else {
    disableButton(closeDuplicatesBtn);
  }
  // if some tabs are checked, enable move & delete buttons
  if (checkedTabObjects.length > 0) {
    [moveToTopBtn, moveToBottomBtn, closeSeletedBtn].forEach(btn =>
      enableButton(btn)
    );
  } else {
    [moveToTopBtn, moveToBottomBtn, closeSeletedBtn].forEach(btn =>
      disableButton(btn)
    );
  }
}

module.exports = adjustMenu;
