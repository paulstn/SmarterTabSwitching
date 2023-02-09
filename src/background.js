// keep an mru cache for every window

var DEBUG = true;

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener(function(command) {
  // the 'switch-tab' command is defined in the manifest
  if (command === "switch-tab") {
      console.log("command triggered");

      // we're looking within session data to grab the lastTabId
      chrome.storage.session.get(["lastTabId"]).then((result) => {
        console.log("Value currently is " + result.lastTabId);
        // the update method grabs the tab it receives in the first parameter and
        //   makes its 'active' and 'highlight' features true, which acts to switch to it
        // 'active' lets the tab be computationally active
        // 'highlighted' does the actual switching to the tab
        chrome.tabs.update(result.lastTabId, {active: true, highlighted: true});
      });

  }
});

//run whenever we start Chrome, initialize MRU Cache
chrome.runtime.onStartup.addListener(async function(){
  var tabs = await chrome.tabs.query({"currentWindow": true});
  chrome.storage.session.set({"MRU-ID-Cache": tabs.map(function(tab) {
    return tab.tabId;
  })})
  .then(() => logMRU());
})

function logMRU() {
  if (DEBUG) {
    chrome.storage.session.get(["MRU-ID-Cache"]).then((result) => {
      console.log("MRU Cache: " + result.MRU_ID_Cache);
    });
  }
}

// Listen for every new tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
  // need to keep session data stored. otherwise, data will get removed when the service worker
  // gets shut down, which happens if another program is in focus within the device

  chrome.storage.session.get(["MRU-ID-Cache"]).then((result) => {
    chrome.storage.session.set({ "lastTabId": result.currTabId }).then(() => {
      console.log("lastTabId is set to " + result.currTabId);
    });
  });

  // this gets the value of currTabId from session storage, and sets lastTabId to it
  chrome.storage.session.get(["currTabId"]).then((result) => {
    chrome.storage.session.set({ "lastTabId": result.currTabId }).then(() => {
      console.log("lastTabId is set to " + result.currTabId);
    });
  });
  // this set the value of currTabId to the current tab's id
  chrome.storage.session.set({ "currTabId": activeInfo.tabId }).then(() => {
    console.log("currTabId is set to " + activeInfo.tabId);
  });

  // TODO: should we implement an inverted index to have quick removing?

  // mruCache.push(activeInfo.tabId);
});
