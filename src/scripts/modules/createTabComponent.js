"use strict";

import { createCheckboxSvg } from "./util";
import { createDuplicateIndicatorSvg } from "./util";

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
  const checkboxIcon = createCheckboxSvg();
  label.append(checkbox);
  label.append(checkboxIcon);

  // create favIcon
  const favIcon = document.createElement("img");
  favIcon.classList.add("tab__favicon");
  favIcon.src = tab.favIconUrl;

  const domainName = tab.url.match(/(?<=:\/\/).+?(?=\/|$)/);
  favIcon.alt = domainName;

  // create tab Title
  const p = document.createElement("p");
  p.classList.add("tab__title");
  p.textContent = tab.title;

  // create delete button
  const closeTabBtn = document.createElement("button");
  closeTabBtn.title = "Close tab";
  closeTabBtn.classList.add("tab__close-tab-button");
  const closeTabIcon = document.createElement("img");
  closeTabIcon.src = "images/delete-icon@20x20.svg";
  closeTabIcon.alt = "Close tab";
  closeTabBtn.appendChild(closeTabIcon);

  // create tab button
  const tabButton = document.createElement("button");
  tabButton.classList.add("tab__tab-button");

  if (tab.isActive === true) {
    tabComponent.classList.add("tab--active");
    // const activeIndicator = document.createElement("div");
    // activeIndicator.classList.add("tab__active-indicator");
    // tabComponent.appendChild(activeIndicator);
  }
  tabComponent.appendChild(tabButton);
  tabComponent.appendChild(label);
  tabComponent.appendChild(favIcon);
  tabComponent.appendChild(p);
  if (tab.isDuplicate === true) {
    tabComponent.classList.add("tab--duplicate");
    const duplicateIndicator = createDuplicateIndicatorSvg();
    duplicateIndicator.alt = "Duplicate tab indicator";
    tabComponent.appendChild(duplicateIndicator);
  }
  tabComponent.appendChild(closeTabBtn);
  // tabComponent.appendChild(tabButton);

  return tabComponent;
}

export { createTabComponent };
