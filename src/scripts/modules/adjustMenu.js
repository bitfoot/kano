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
  // const moveToTopBtn = document.getElementById("move-to-top-btn");
  // const moveToBottomBtn = document.getElementById("move-to-bottom-btn");
  // const closeSeletedBtn = document.getElementById("close-selected-btn");
  // const closeDuplicatesBtn = document.getElementById("close-duplicates-btn");
  const selectDeselectAllBtn = document.getElementById(
    "select-deselect-all-btn"
  );

  // get currently visible tabs
  const tabs = document.getElementsByClassName("tab");
  // const tabs = state.tabs;
  const numOfVisibleTabs = [...tabs].reduce((a, t) => {
    if (!t.classList.contains("tab--hidden")) {
      a += 1;
    }
    return a;
  }, 0);
  // console.log(listedTabs.length, state.filteredOutTabs);
  // if there are no listed tabs (such as when they are all filtered out), disable all buttons
  if (numOfVisibleTabs < 1) {
    menuButtons.forEach(btn => {
      disableButton(btn);
    });
  } else {
    enableButton(selectDeselectAllBtn);
  }
}

module.exports = adjustMenu;
