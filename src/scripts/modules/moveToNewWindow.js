"use strict";

import { deleteTabs } from "./deleteTabs";

function moveToNewWindow() {
  // const tabComponentIds = this.menu.checkedVisibleTabs.map(tab => tab.id);
  const tabComponentIds = [];
  const browserTabIds = [];
  this.menu.checkedVisibleTabs.forEach(tab => {
    tabComponentIds.push(tab.id);
    browserTabIds.push(+tab.id.split("-")[1]);
  });

  const getNewWindowPositionInfo = async () => {
    const currentWindowData = await chrome.windows.getCurrent();
    const posInfo = {
      top: currentWindowData.top,
      left: 0,
      isToTheRightOfCurrentWindow: false
    };

    const screenWidth = window.screen.availWidth;
    const availLeft = window.screen.availLeft;
    const spaceToTheLeft = currentWindowData.left - availLeft;
    const spaceToTheRight =
      screenWidth + availLeft - spaceToTheLeft - currentWindowData.width;

    if (spaceToTheLeft >= spaceToTheRight) {
      if (spaceToTheLeft > currentWindowData.width) {
        posInfo.left = spaceToTheLeft + availLeft - currentWindowData.width;
      } else {
        posInfo.left = availLeft;
      }
    } else {
      posInfo.isToTheRightOfCurrentWindow = true;
      if (spaceToTheRight > currentWindowData.width) {
        posInfo.left = spaceToTheLeft + availLeft + currentWindowData.width;
      } else {
        posInfo.left = screenWidth + availLeft - currentWindowData.width;
      }
    }
    return posInfo;
  };

  // move browser tabs over to a new window
  getNewWindowPositionInfo().then(posInfo => {
    // remove tabs from the DOM and update state to reflect these changes
    // posInfo.isToTheRightOfCurrentWindow;

    const firstId = browserTabIds[0];
    const createData = {
      tabId: firstId,
      top: posInfo.top,
      left: posInfo.left
    };

    const options = {
      tabComponentIds,
      movingToNewWindow: true,
      browserTabIds,
      createData,
      newWindowIsToTheRight: posInfo.isToTheRightOfCurrentWindow
    };

    deleteTabs.call(this, options);

    // chrome.windows.create(createData).then(windowData => {
    //   const windowId = windowData.id;
    //   const remainingTabIds = browserTabIds.slice(1);
    //   if (remainingTabIds.length > 0) {
    //     chrome.tabs.move(remainingTabIds, {
    //       windowId,
    //       index: 1
    //     });
    //   }
    // });
  });
}

export { moveToNewWindow };
