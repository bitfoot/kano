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

  if (this.menu.buttons.moveToNewWindow.element === null) {
    this.menu.buttons.moveToNewWindow.element = document.getElementById(
      "move-to-new-window-btn"
    );
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

  let firstUncheckedPinnedIndex = null;
  let lastCheckedPinnedIndex = null;
  let lastUncheckedPinnedIndex = null;
  let firstCheckedPinnedIndex = null;

  let firstUncheckedUnpinnedIndex = null;
  let lastCheckedUnpinnedIndex = null;
  let lastUncheckedUnpinnedIndex = null;
  let firstCheckedUnpinnedIndex = null;

  const firstHiddenPinnedTabIndex = this.filterState.firstHiddenPinnedTabIndex;
  const lastHiddenPinnedTabIndex = this.filterState.lastHiddenPinnedTabIndex;
  const firstHiddenUnpinnedTabIndex = this.filterState
    .firstHiddenUnpinnedTabIndex;
  const lastHiddenUnpinnedTabIndex = this.filterState
    .lastHiddenUnpinnedTabIndex;
  let visibleDuplicatesExist = false;

  this.visibleTabIds.forEach(id => {
    const indexInBrowser = this.tabIndices[id][0];
    const tabObject = this.orderedTabObjects[indexInBrowser];
    if (tabObject.isDuplicate) {
      visibleDuplicatesExist = true;
    }

    if (tabObject.isChecked) {
      this.menu.checkedVisibleTabs.push(this.tabs[indexInBrowser]);
      if (tabObject.isPinned) {
        if (firstCheckedPinnedIndex === null) {
          firstCheckedPinnedIndex = indexInBrowser;
        }
        lastCheckedPinnedIndex = indexInBrowser;
      } else {
        if (firstCheckedUnpinnedIndex === null) {
          firstCheckedUnpinnedIndex = indexInBrowser;
        }
        lastCheckedUnpinnedIndex = indexInBrowser;
      }
    } else {
      if (tabObject.isPinned) {
        if (firstUncheckedPinnedIndex === null) {
          firstUncheckedPinnedIndex = indexInBrowser;
        }
        lastUncheckedPinnedIndex = indexInBrowser;
      } else {
        if (firstUncheckedUnpinnedIndex === null) {
          firstUncheckedUnpinnedIndex = indexInBrowser;
        }
        lastUncheckedUnpinnedIndex = indexInBrowser;
      }
    }
  });

  // console.log(this.menu.checkedVisibleTabs);
  const buttonsToDisable = [];
  const buttonsToEnable = [];
  const checkedVisibleTabsExist =
    lastCheckedUnpinnedIndex !== null || lastCheckedPinnedIndex !== null;

  if (checkedVisibleTabsExist) {
    buttonsToEnable.push(this.menu.buttons.moveToNewWindow);
    const uncheckedUnpinnedTabsAboveExist =
      firstUncheckedUnpinnedIndex !== null &&
      lastCheckedUnpinnedIndex !== null &&
      firstUncheckedUnpinnedIndex < lastCheckedUnpinnedIndex;

    const uncheckedPinnedTabsAboveExist =
      firstUncheckedPinnedIndex !== null &&
      lastCheckedPinnedIndex !== null &&
      firstUncheckedPinnedIndex < lastCheckedPinnedIndex;

    const uncheckedTabsAboveExist =
      uncheckedUnpinnedTabsAboveExist || uncheckedPinnedTabsAboveExist;

    const hiddenPinnedTabsAboveExist =
      firstHiddenPinnedTabIndex !== null &&
      lastCheckedPinnedIndex !== null &&
      firstHiddenPinnedTabIndex < lastCheckedPinnedIndex;

    const hiddenUnpinnedTabsAboveExist =
      firstHiddenUnpinnedTabIndex !== null &&
      lastCheckedUnpinnedIndex !== null &&
      firstHiddenUnpinnedTabIndex < lastCheckedUnpinnedIndex;

    const hiddenTabsAboveExist =
      hiddenPinnedTabsAboveExist || hiddenUnpinnedTabsAboveExist;

    const uncheckedUnpinnedTabsBelowExist =
      lastUncheckedUnpinnedIndex !== null &&
      firstCheckedUnpinnedIndex !== null &&
      lastUncheckedUnpinnedIndex > firstCheckedUnpinnedIndex;

    const uncheckedPinnedTabsBelowExist =
      lastUncheckedPinnedIndex !== null &&
      firstCheckedPinnedIndex !== null &&
      lastUncheckedPinnedIndex > firstCheckedPinnedIndex;

    const uncheckedTabsBelowExist =
      uncheckedUnpinnedTabsBelowExist || uncheckedPinnedTabsBelowExist;

    const hiddenPinnedTabsBelowExist =
      lastHiddenPinnedTabIndex !== null &&
      firstCheckedPinnedIndex !== null &&
      lastHiddenPinnedTabIndex > firstCheckedPinnedIndex;

    const hiddenUnpinnedTabsBelowExist =
      lastHiddenUnpinnedTabIndex !== null &&
      firstCheckedUnpinnedIndex !== null &&
      lastHiddenUnpinnedTabIndex > firstCheckedUnpinnedIndex;

    const hiddenTabsBelowExist =
      hiddenPinnedTabsBelowExist || hiddenUnpinnedTabsBelowExist;

    if (uncheckedTabsAboveExist || hiddenTabsAboveExist) {
      buttonsToEnable.push(this.menu.buttons.moveToTheTop);
    } else {
      buttonsToDisable.push(this.menu.buttons.moveToTheTop);
    }

    if (uncheckedTabsBelowExist || hiddenTabsBelowExist) {
      buttonsToEnable.push(this.menu.buttons.moveToTheBottom);
    } else {
      buttonsToDisable.push(this.menu.buttons.moveToTheBottom);
    }

    buttonsToEnable.push(this.menu.buttons.closeSelected);
  } else {
    buttonsToDisable.push(this.menu.buttons.moveToNewWindow);
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

export { adjustMenu };
