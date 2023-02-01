var currTabIndex = 0;
var lastTabIndex = -1;

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener(function(command) {
  // the 'switch-tab' command is defined in the manifest
  if (command === "switch-tab") {
      console.log("command triggered");
      // the 'query' method essentially queries chrome.tabs for an entry
      // the parameter here is saying 'give me all the tabs within the current window'
      // the second argument is a function we provide, that has an argument (tabs) which
      //   is received from the query and then the function later switches between tabs
      chrome.tabs.query({currentWindow: true}, function(tabs) {
          console.log(tabs);
          // we have assertions here to check if the last tab index is invalid
          console.assert((lastTabIndex >= 0), "The last tab index is less than 0");
          console.assert((lastTabIndex < tabs.length), "The last tab index is more than the number of tabs");
          console.log(tabs[lastTabIndex]);
          console.log(`lastTabIndex listed: ${lastTabIndex}`)
          // the update method grabs the tab it receives in the first parameter and
          //   makes its 'active' and 'highlight' features true, which acts to switch to it
          // 'active' lets the tab be computationally active
          // 'highlighted' does the actual switching to the tab
          chrome.tabs.update(tabs[lastTabIndex].id, {active: true, highlighted: true});
      });
  }
});

// Listen for every new tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
  // console.log(activeInfo);
  lastTabIndex = currTabIndex;
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    currTabIndex = tab.index;
  });
  console.log(`lastTabIndex: ${lastTabIndex}, currTabIndex: ${currTabIndex}`);
});
