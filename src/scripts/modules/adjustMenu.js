"use strict";

function adjustMenu() {
  const disableButton = btn => {
    window.requestAnimationFrame(() => {
      btn.setAttribute("disabled", true);
      btn.classList.add("menu-item-btn--disabled");
    });
  };

  const enableButton = btn => {
    window.requestAnimationFrame(() => {
      btn.removeAttribute("disabled");
      btn.classList.remove("menu-item-btn--disabled");
    });
  };

  if (this.menu.buttons.closeSelected.element === null) {
    this.menu.buttons.closeSelected.element = document.getElementById(
      "close-selected-btn"
    );
    this.menu.buttons.moveToTheBottom.element = document.getElementById(
      "move-to-bottom-btn"
    );
    this.menu.buttons.moveToTheTop.element = document.getElementById(
      "move-to-top-btn"
    );
    this.menu.buttons.closeDuplicates.element = document.getElementById(
      "close-duplicates-btn"
    );
    this.menu.buttons.selectDeselectAll.element = document.getElementById(
      "select-deselect-all-btn"
    );
  }

  this.menu.checkedVisibleTabs = [];
  let firstUncheckedVisibleIndex = null;
  let lastCheckedVisibleIndex = null;
  const firstHiddenTabIndex = this.filterState.firstHiddenTabIndex;
  let lastUncheckedVisibleIndex = null;
  let firstCheckedVisibleIndex = null;
  const lastHiddenTabIndex = this.filterState.lastHiddenTabIndex;
  let visibleDuplicatesExist = false;

  this.visibleTabIds.forEach(id => {
    const indexInBrowser = this.tabIndices[id][0];
    const tabObject = this.orderedTabObjects[indexInBrowser];
    if (tabObject.isDuplicate) {
      visibleDuplicatesExist = true;
    }

    if (tabObject.isChecked) {
      if (firstCheckedVisibleIndex === null) {
        firstCheckedVisibleIndex = indexInBrowser;
      }
      lastCheckedVisibleIndex = indexInBrowser;
      this.menu.checkedVisibleTabs.push(this.tabs[indexInBrowser]);
    } else {
      if (firstUncheckedVisibleIndex === null) {
        firstUncheckedVisibleIndex = indexInBrowser;
      }
      lastUncheckedVisibleIndex = indexInBrowser;
    }
  });

  // console.log(this.menu.checkedVisibleTabs);
  const buttonsToDisable = [];
  const buttonsToEnable = [];
  const checkedVisibleTabsExist = lastCheckedVisibleIndex !== null;

  if (checkedVisibleTabsExist) {
    const uncheckedVisibleTabsAboveExist =
      firstUncheckedVisibleIndex !== null &&
      firstUncheckedVisibleIndex < lastCheckedVisibleIndex;

    const hiddenTabsAboveExist =
      firstHiddenTabIndex !== null &&
      firstHiddenTabIndex < lastCheckedVisibleIndex;

    const uncheckedVisibleTabsBelowExist =
      lastUncheckedVisibleIndex !== null &&
      lastUncheckedVisibleIndex > firstCheckedVisibleIndex;

    const hiddenTabsBelowExist =
      lastHiddenTabIndex !== null &&
      lastHiddenTabIndex > firstCheckedVisibleIndex;

    if (uncheckedVisibleTabsAboveExist || hiddenTabsAboveExist) {
      buttonsToEnable.push(this.menu.buttons.moveToTheTop);
    } else {
      buttonsToDisable.push(this.menu.buttons.moveToTheTop);
    }

    if (uncheckedVisibleTabsBelowExist || hiddenTabsBelowExist) {
      buttonsToEnable.push(this.menu.buttons.moveToTheBottom);
    } else {
      buttonsToDisable.push(this.menu.buttons.moveToTheBottom);
    }

    buttonsToEnable.push(this.menu.buttons.closeSelected);
  } else {
    buttonsToDisable.push(this.menu.buttons.closeSelected);
    buttonsToDisable.push(this.menu.buttons.moveToTheBottom);
    buttonsToDisable.push(this.menu.buttons.moveToTheTop);
  }

  const allTabsAreHidden = this.visibleTabIds.length === 0;
  if (allTabsAreHidden === false) {
    buttonsToEnable.push(this.menu.buttons.selectDeselectAll);
  } else {
    buttonsToDisable.push(this.menu.buttons.selectDeselectAll);
  }

  if (visibleDuplicatesExist === true) {
    buttonsToEnable.push(this.menu.buttons.closeDuplicates);
  } else {
    buttonsToDisable.push(this.menu.buttons.closeDuplicates);
  }

  buttonsToDisable.forEach(button => {
    button.shouldBeEnabled = false;
    disableButton(button.element);
  });

  buttonsToEnable.forEach(button => {
    button.shouldBeEnabled = true;
    enableButton(button.element);
  });
}

module.exports = adjustMenu;
