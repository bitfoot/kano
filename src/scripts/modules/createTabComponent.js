"use strict";

const createCheckboxSvg = require("./util").createCheckboxSvg;
const createDuplicateIndicatorSvg = require("./util")
  .createDuplicateIndicatorSvg;

function createTabComponent(tab) {
  const tabComponent = document.createElement("li");
  tabComponent.id = tab.id;
  tabComponent.classList.add("tab");

  // create checkbox
  const checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  checkbox.id = `checkbox-${tab.id}`;
  checkbox.classList.add("tab__checkbox");

  // create checkbox label
  const label = document.createElement("label");
  label.classList.add("tab__checkbox-label");
  label.for = checkbox.id;
  // label.tabIndex = 0;
  const checkboxIcon = createCheckboxSvg();
  checkboxIcon.classList.add(`tab__svg-checkbox`);
  label.append(checkbox);
  label.append(checkboxIcon);

  // create favIcon
  const favIcon = document.createElement("img");
  favIcon.classList.add("tab__favicon");
  if (tab.favIconUrl != "" && tab.favIconUrl != undefined) {
    favIcon.src = tab.favIconUrl;
  } else {
    // get back to this part after Chrome implements the new favicon API for manifest v3
    // favIcon.src = "chrome://favicon/" + tab.url;
    favIcon.src = "images/default20.png";
  }

  const domainName = tab.url.match(/(?<=:\/\/).+?(?=\/|$)/);
  favIcon.alt = domainName;

  // create tab Title
  const p = document.createElement("p");
  p.classList.add("tab__title");

  // this soulution isn't good, can't handle 44 Ws
  p.textContent = tab.title;

  // create delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("tab__delete-button");
  const deleteIcon = document.createElement("img");
  deleteIcon.src = "images/delete-icon@20x20.svg";
  deleteButton.appendChild(deleteIcon);

  // create tab button
  const tabButton = document.createElement("button");
  tabButton.classList.add("tab__tab-button");

  if (tab.isActive === true) {
    tabComponent.classList.add("tab--active");
    // create active tab indicator
    const activeIndicator = document.createElement("div");
    activeIndicator.classList.add("tab__active-indicator");
    tabComponent.appendChild(activeIndicator);
  }
  tabComponent.appendChild(tabButton);
  tabComponent.appendChild(label);
  tabComponent.appendChild(favIcon);
  tabComponent.appendChild(p);
  if (tab.isDuplicate === true) {
    tabComponent.classList.add("tab--duplicate");
    // create duplicate indicator
    const duplicateIndicator = createDuplicateIndicatorSvg();
    tabComponent.appendChild(duplicateIndicator);
  }
  tabComponent.appendChild(deleteButton);

  return tabComponent;
}

module.exports = createTabComponent;
