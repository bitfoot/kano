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

  this.menu.firstUncheckedPinnedIndex = null;
  this.menu.lastCheckedPinnedIndex = null;
  this.menu.lastUncheckedPinnedIndex = null;
  this.menu.firstCheckedPinnedIndex = null;

  this.menu.firstUncheckedUnpinnedIndex = null;
  this.menu.lastCheckedUnpinnedIndex = null;
  this.menu.lastUncheckedUnpinnedIndex = null;
  this.menu.firstCheckedUnpinnedIndex = null;
  this.menu.numPinnedTabs = 0;

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

    if (tabObject.isPinned === true) {
      this.menu.numPinnedTabs += 1;
      if (tabObject.isChecked) {
        if (this.menu.firstCheckedPinnedIndex === null) {
          this.menu.firstCheckedPinnedIndex = indexInBrowser;
        }
        this.menu.lastCheckedPinnedIndex = indexInBrowser;
      } else {
        if (this.menu.firstUncheckedPinnedIndex === null) {
          this.menu.firstUncheckedPinnedIndex = indexInBrowser;
        }
        this.menu.lastUncheckedPinnedIndex = indexInBrowser;
      }
    } else {
      if (tabObject.isChecked) {
        if (this.menu.firstCheckedUnpinnedIndex === null) {
          this.menu.firstCheckedUnpinnedIndex = indexInBrowser;
        }
        this.menu.lastCheckedUnpinnedIndex = indexInBrowser;
      } else {
        if (this.menu.firstUncheckedUnpinnedIndex === null) {
          this.menu.firstUncheckedUnpinnedIndex = indexInBrowser;
        }
        this.menu.lastUncheckedUnpinnedIndex = indexInBrowser;
      }
    }
  });

  this.menu.numUnpinnedTabs =
    this.visibleTabIds.length - this.menu.numPinnedTabs;
  const buttonsToDisable = [];
  const buttonsToEnable = [];
  const checkedVisibleTabsExist =
    this.menu.lastCheckedUnpinnedIndex !== null ||
    this.menu.lastCheckedPinnedIndex !== null;

  if (checkedVisibleTabsExist) {
    buttonsToEnable.push(this.menu.buttons.moveToNewWindow);
    const uncheckedUnpinnedTabsAboveExist =
      this.menu.firstUncheckedUnpinnedIndex !== null &&
      this.menu.lastCheckedUnpinnedIndex !== null &&
      this.menu.firstUncheckedUnpinnedIndex <
      this.menu.lastCheckedUnpinnedIndex;

    const uncheckedPinnedTabsAboveExist =
      this.menu.firstUncheckedPinnedIndex !== null &&
      this.menu.lastCheckedPinnedIndex !== null &&
      this.menu.firstUncheckedPinnedIndex < this.menu.lastCheckedPinnedIndex;

    const uncheckedTabsAboveExist =
      uncheckedUnpinnedTabsAboveExist || uncheckedPinnedTabsAboveExist;

    const hiddenPinnedTabsAboveExist =
      firstHiddenPinnedTabIndex !== null &&
      this.menu.lastCheckedPinnedIndex !== null &&
      firstHiddenPinnedTabIndex < this.menu.lastCheckedPinnedIndex;

    const hiddenUnpinnedTabsAboveExist =
      firstHiddenUnpinnedTabIndex !== null &&
      this.menu.lastCheckedUnpinnedIndex !== null &&
      firstHiddenUnpinnedTabIndex < this.menu.lastCheckedUnpinnedIndex;

    const hiddenTabsAboveExist =
      hiddenPinnedTabsAboveExist || hiddenUnpinnedTabsAboveExist;

    const uncheckedUnpinnedTabsBelowExist =
      this.menu.lastUncheckedUnpinnedIndex !== null &&
      this.menu.firstCheckedUnpinnedIndex !== null &&
      this.menu.lastUncheckedUnpinnedIndex >
      this.menu.firstCheckedUnpinnedIndex;

    const uncheckedPinnedTabsBelowExist =
      this.menu.lastUncheckedPinnedIndex !== null &&
      this.menu.firstCheckedPinnedIndex !== null &&
      this.menu.lastUncheckedPinnedIndex > this.menu.firstCheckedPinnedIndex;

    const uncheckedTabsBelowExist =
      uncheckedUnpinnedTabsBelowExist || uncheckedPinnedTabsBelowExist;

    const hiddenPinnedTabsBelowExist =
      lastHiddenPinnedTabIndex !== null &&
      this.menu.firstCheckedPinnedIndex !== null &&
      lastHiddenPinnedTabIndex > this.menu.firstCheckedPinnedIndex;

    const hiddenUnpinnedTabsBelowExist =
      lastHiddenUnpinnedTabIndex !== null &&
      this.menu.firstCheckedUnpinnedIndex !== null &&
      lastHiddenUnpinnedTabIndex > this.menu.firstCheckedUnpinnedIndex;

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
