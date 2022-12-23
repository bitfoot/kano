"use strict";

const easeInOutQuad = require("./util").easeInOutQuad;

function moveTabs(direction) {
  const checkedVisibleTabs = this.menuData.checkedVisibleTabs;
  const lastTabIndex = this.orderedTabObjects.length - 1;
  const numHiddenTabs =
    this.orderedTabObjects.length - this.visibleTabIds.length;
  const movedTabFilterOffset = direction === "bottom" ? numHiddenTabs * -46 : 0;
  // let relevantUncheckedTabs;
  // if (direction === "bottom") {
  //   relevantUncheckedTabs =
  // }
  let numCheckedAbove = 0;
  let numUncheckedAbove = 0;
  let blockIndex = null;
  let lastVisibleIsChecked = false;
  const tabHeight = 40;
  const margin = 6;
  const tabRowHeight = tabHeight + margin;
  let indexOfNextUncheckedTabObj = 0;

  // get info about tabs
  this.moveState = {
    tabRowHeight,
    checkedVisibleTabs,
    uncheckedTabObjs: [],
    direction,
    animation: null,
    animationStart: null,
    previousTimeStamp: null,
    animationElapsed: null,
    animationDuration: 6200,
    blocks: [],
    getMoveDistance(block) {
      let progress = Math.min(
        1,
        this.animationElapsed / this.animationDuration
      );
      let prevDistanceMoved = block.totalDistanceMoved;

      block.totalDistanceMoved = easeInOutQuad(
        progress,
        0,
        block.totalDistanceToMove,
        1
      );
      block.distanceToMoveInOneFrame =
        block.totalDistanceMoved - prevDistanceMoved;

      return block.distanceToMoveInOneFrame;
    },
    step: function (timestamp) {
      // console.log(this);
      // if (this.dragState === null) return;
      if (this.moveState.animationStart === null) {
        this.moveState.animationStart = timestamp;
      }

      // animationElapsed is the same for all blocks
      this.moveState.animationElapsed =
        timestamp - this.moveState.animationStart;

      if (this.moveState.previousTimeStamp !== timestamp) {
        this.moveState.previousTimeStamp = timestamp;
        // getMoveDistance for each block
        // console.log(this);

        if (this.moveState.animation) {
          // update positions of blocks (checked tabs)
          this.moveState.blocks.forEach((block, blockIndex) => {
            const moveDistance = this.moveState.getMoveDistance(block);
            // update block position
            block.topPos += moveDistance;
            block.bottomPos += moveDistance;
            // style tabs within the block
            // console.log(`totalDistanceMoved: ${block.totalDistanceMoved}`);
            block.tabs.forEach(tab => {
              tab.style.setProperty(
                "--y-offset",
                block.totalDistanceMoved + "px"
              );
            });
            console.log(
              `blockIndex: ${blockIndex}, block.topPos: ${block.topPos
              }, block.bottomPos: ${block.bottomPos}, block.initialTopPos: ${block.initialTopPos
              } `
            );
            // style tabs below the block
            // console.log(
            //   `blockIndex: ${blockIndex}, indexOfNextUncheckedTabObj: ${block.indexOfNextUncheckedTabObj
            //   }, numUncheckedBelow: ${block.numUncheckedBelow}`
            // );
            for (
              let index = block.indexOfNextUncheckedTabObj;
              index < block.numUncheckedBelow;
              index++
            ) {
              const tabObj = this.moveState.uncheckedTabObjs[index];
              // console.log(`tabObj.currentTopPos: ${tabObj.currentTopPos}`);

              if (tabObj.currentTopPos > block.bottomPos) {
                console.log("breaking!");
                break;
              } else {
                const difference = tabObj.initialTopPos - block.bottomPos;
                const ratioToTabHeight = Math.min(
                  1,
                  Math.abs(difference) / tabHeight
                );
                const maxOffset = (block.height + margin) * -1;
                const distanceToMove = maxOffset * ratioToTabHeight;
                tabObj.currentTopPos = tabObj.initialTopPos + distanceToMove;
                // console.log(
                //   `tabObj.currentTopPos: ${tabObj.currentTopPos
                //   }, indexOfNextUncheckedTabObj: ${block.indexOfNextUncheckedTabObj
                //   }, tabObjIndex: ${index}`
                // );
                let offset = tabObj.currentTopPos - tabObj.initialTopPos;
                if (offset <= maxOffset) {
                  offset = maxOffset;
                  tabObj.initialTopPos += offset;
                  block.indexOfNextUncheckedTabObj += 1;
                }
                tabObj.tab.style.setProperty("--y-offset", offset + "px");
              }
              // console.log(tabObj);
            }
          });
          // update positions of surrounding unchecked tabs
          // this.moveState.uncheckedTabObjs.forEach(obj => {
          //   // console.log(obj);
          //   // this.moveState.blocks.forEach(block => {
          //   //   const difference = obj.initialTopPos - block.bottomPos;
          //   //   obj.tab.style.setProperty("--y-offset", difference + "px");
          //   //   console.log(difference);
          //   // });
          // });
        }
      }

      if (this.moveState.animationElapsed >= this.moveState.animationDuration) {
        this.moveState.animation = null;
      }

      if (this.moveState.animation) {
        window.requestAnimationFrame(this.moveState.step);
      } else {
        // if animation ended it means it's time to reset variables and move tabs in the DOM
        this.moveState.checkedVisibleTabs.forEach(tab => {
          tab.classList.remove("tab--banana");
          tab.style.setProperty("--y-offset", 0 + "px");
        });
        this.moveState.uncheckedTabObjs.forEach(obj => {
          obj.tab.classList.remove("tab--peach");
          obj.tab.style.setProperty("--y-offset", 0 + "px");
        });
        this.moveState.moveTabsInTheDOM(
          this.moveState.checkedVisibleTabs,
          this.moveState.direction
        );
      }
    }.bind(this),
    moveTabsInTheDOM: function (tabsToMove) {
      const fragmentOfChecked = document.createDocumentFragment();

      tabsToMove.forEach(tab => {
        fragmentOfChecked.appendChild(tab);
      });

      if (this.moveState.direction === "bottom") {
        const lastIndex = this.orderedTabObjects.length - 1;

        this.tabList.insertBefore(
          fragmentOfChecked,
          this.tabs[lastIndex].nextSibling
        );
      } else {
        this.tabList.insertBefore(fragmentOfChecked, this.tabList.firstChild);
      }

      this.tabs = [...this.tabList.children];

      this.visibleTabIds.forEach(id => {
        const index = this.tabIndices[id][0];
        const tab = this.tabs[index];
        if (this.filterState.tabs[id]) {
          tab.style.setProperty(
            "--y-offset",
            this.filterState.tabs[id].filterOffset + "px"
          );
        }
      });
    }.bind(this)
  };
  const reorderedVisibleTabIds = [];
  const reorderedTabObjects = [];

  this.orderedTabObjects.forEach((obj, index) => {
    const id = obj.id;

    if (direction === "bottom") {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        // if tab is NOT checked
        if (obj.isChecked === false) {
          numUncheckedAbove += 1;
          // if no checked tabs exist above, there's no need to do anything else for this tab
          if (numCheckedAbove === 0) return;
          const initialTopPos =
            this.tabIndices[id][1] * this.moveState.tabRowHeight;
          this.tabIndices[id] = [
            this.tabIndices[id][0] - numCheckedAbove,
            this.tabIndices[id][1] - numCheckedAbove
          ];
          const totalDistanceToMove = numCheckedAbove * tabRowHeight * -1;
          const tab = this.tabs[index];
          tab.classList.add("tab--peach");
          const uncheckedTabObj = {
            tab,
            initialTopPos,
            currentTopPos: initialTopPos,
            currentBottomPos: initialTopPos + tabHeight,
            totalDistanceToMove,
            indexOfLastBlockAbove: blockIndex
          };
          this.moveState.uncheckedTabObjs.push(uncheckedTabObj);
          // numUncheckedAbove += 1;
          indexOfNextUncheckedTabObj += 1;
          lastVisibleIsChecked = false;
        } else {
          // if tab IS checked
          const numCheckedBelow =
            this.menuData.numChecked - numCheckedAbove - 1;
          const numUncheckedBelow =
            this.menuData.numUnchecked - numUncheckedAbove;

          const visibleTopPos = this.tabIndices[id][1] * tabRowHeight;
          const tab = this.tabs[index];
          tab.classList.add("tab--banana");

          this.tabIndices[id] = [
            lastTabIndex - numCheckedBelow,
            this.tabIndices[id][1] + numUncheckedBelow
          ];
          if (this.filterState.tabs[id]) {
            this.filterState.tabs[id].filterOffset = movedTabFilterOffset;
          }

          if (lastVisibleIsChecked === false) {
            if (blockIndex === null) {
              blockIndex = 0;
            } else {
              blockIndex += 1;
            }
            if (indexOfNextUncheckedTabObj === null && numUncheckedBelow > 0) {
              indexOfNextUncheckedTabObj = 0;
            }
            const block = {
              height: tabHeight,
              initialTopPos: visibleTopPos,
              numUncheckedBelow,
              topPos: visibleTopPos,
              bottomPos: visibleTopPos + tabHeight,
              totalDistanceToMove: numUncheckedBelow * tabRowHeight,
              totalDistanceMoved: 0,
              distanceToMoveInOneFrame: 0,
              indexOfNextUncheckedTabObj,
              tabs: [tab]
            };
            this.moveState.blocks[blockIndex] = block;
          } else {
            this.moveState.blocks[blockIndex].tabs.push(tab);
            this.moveState.blocks[blockIndex].height += tabRowHeight;
            this.moveState.blocks[blockIndex].bottomPos += tabRowHeight;
          }

          numCheckedAbove += 1;
          lastVisibleIsChecked = true;
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        this.tabIndices[id][0] -= numCheckedAbove;
      }
    } else {
      // if tab is visible
      if (this.tabIndices[id][1] !== null) {
        this.moveState[id] = {};
        // if tab is NOT checked
        if (obj.isChecked === false) {
          const numCheckedBelow = this.menuData.numChecked - numCheckedAbove;
          this.tabIndices[id] = [
            this.tabIndices[id][0] + numCheckedBelow,
            this.tabIndices[id][1] + numCheckedBelow
          ];
          this.moveState[id].distance = numCheckedBelow * tabRowHeight;
          numUncheckedAbove += 1;
        } else {
          // if tab IS checked
          this.tabIndices[id] = [numCheckedAbove, numCheckedAbove];

          if (this.filterState.tabs[id]) {
            this.filterState.tabs[id].filterOffset = 0;
          }
          this.moveState[id].distance = numUncheckedAbove * tabRowHeight * -1;
          numCheckedAbove += 1;
        }
        reorderedVisibleTabIds[this.tabIndices[id][1]] = id;
      } else {
        // if tab is hidden
        const numCheckedBelow = this.menuData.numChecked - numCheckedAbove;
        this.tabIndices[id][0] += numCheckedBelow;
      }
    }
    reorderedTabObjects[this.tabIndices[id][0]] = obj;
  });

  // console.log(this.orderedTabObjects);
  // console.log(reorderedTabObjects);
  // console.log(this.moveState);

  // const getMoveDistance = block => {
  //   let progress = Math.min(1, this.animationElapsed / this.animationDuration);
  //   let prevDistanceMoved = block.totalDistanceMoved;

  //   block.totalDistanceMoved = easeInOutQuad(
  //     progress,
  //     0,
  //     block.totalDistanceToMove,
  //     1
  //   );
  //   block.distanceToMoveInOneFrame =
  //     block.totalDistanceMoved - prevDistanceMoved;

  //   return block.distanceToMoveInOneFrame;
  // };

  // at first, try to move checked tabs only, without animating surrounding tabs

  // const nstep = step.bind(moveState);
  this.moveState.animation = window.requestAnimationFrame(this.moveState.step);

  // animateMovement.call(moveState);

  // move tabs in the DOM
  // const moveTabsInTheDOM = (tabsToMove, direction) => {
  //   const fragmentOfChecked = document.createDocumentFragment();

  //   tabsToMove.forEach(tab => {
  //     fragmentOfChecked.appendChild(tab);
  //   });

  //   if (direction === "bottom") {
  //     const lastIndex = this.orderedTabObjects.length - 1;

  //     this.tabList.insertBefore(
  //       fragmentOfChecked,
  //       this.tabs[lastIndex].nextSibling
  //     );
  //   } else {
  //     this.tabList.insertBefore(fragmentOfChecked, this.tabList.firstChild);
  //   }

  //   this.tabs = [...this.tabList.children];

  //   this.visibleTabIds.forEach(id => {
  //     const index = this.tabIndices[id][0];
  //     const tab = this.tabs[index];
  //     if (this.filterState.tabs[id]) {
  //       tab.style.setProperty(
  //         "--y-offset",
  //         this.filterState.tabs[id].filterOffset + "px"
  //       );
  //     }
  //   });
  // };

  // moveTabsInTheDOM(checkedVisibleTabs, direction);
  this.orderedTabObjects = reorderedTabObjects;
  this.visibleTabIds = reorderedVisibleTabIds;
}

module.exports = moveTabs;
