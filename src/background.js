// chrome.tabs.onActivated.addListener(moveToFirstPosition);

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
          console.log(tabs[0]);
          // the update method grabs the tab it receives in the first parameter and
          //   makes its 'active' and 'highlight' features true, which acts to switch to it
          // 'active' lets the tab be computationally active
          // 'highlighted' does the actual switching to the tab
          chrome.tabs.update(tabs[0].id, {active: true, highlighted: true});
      });
  }
});