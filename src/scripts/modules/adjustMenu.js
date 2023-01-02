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

  if (this.menu.closeSelectedBtn.element === null) {
    this.menu.closeSelectedBtn.element = document.getElementById(
      "close-selected-btn"
    );
    this.menu.moveToTheBottomBtn.element = document.getElementById(
      "move-to-bottom-btn"
    );
    this.menu.moveToTheTopBtn.element = document.getElementById(
      "move-to-top-btn"
    );
    this.menu.closeDuplicatesBtn.element = document.getElementById(
      "close-duplicates-btn"
    );
    this.menu.selectDeselectAllBtn.element = document.getElementById(
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
      buttonsToEnable.push(this.menu.moveToTheTopBtn);
    } else {
      buttonsToDisable.push(this.menu.moveToTheTopBtn);
    }

    if (uncheckedVisibleTabsBelowExist || hiddenTabsBelowExist) {
      buttonsToEnable.push(this.menu.moveToTheBottomBtn);
    } else {
      buttonsToDisable.push(this.menu.moveToTheBottomBtn);
    }

    buttonsToEnable.push(this.menu.closeSelectedBtn);
  } else {
    buttonsToDisable.push(this.menu.closeSelectedBtn);
    buttonsToDisable.push(this.menu.moveToTheBottomBtn);
    buttonsToDisable.push(this.menu.moveToTheTopBtn);
  }

  const allTabsAreHidden = this.visibleTabIds.length === 0;
  if (allTabsAreHidden === false) {
    buttonsToEnable.push(this.menu.selectDeselectAllBtn);
  } else {
    buttonsToDisable.push(this.menu.selectDeselectAllBtn);
  }

  if (visibleDuplicatesExist === true) {
    buttonsToEnable.push(this.menu.closeDuplicatesBtn);
  } else {
    buttonsToDisable.push(this.menu.closeDuplicatesBtn);
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
