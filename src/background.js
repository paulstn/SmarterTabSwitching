// keep an mru cache for every window

var DEBUG = true;

function setMRU(tabs) {
  chrome.storage.session.set({"MRU-ID-Cache": tabs})
  .then(() => logMRU());
}

function logMRU() {
  if (DEBUG) {
    chrome.storage.session.get(["MRU-ID-Cache"]).then((result) => {
      console.log("MRU Cache: " + result.MRU_ID_Cache);
    });
  }
}

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
  var tabIDs = tabs.map(function(tab) {
    return tab.tabId;
  });
  setMRU(tabIDs);
})

// Listen for every new tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
  // need to keep session data stored. otherwise, data will get removed when the service worker
  // gets shut down, which happens if another program is in focus within the device

  chrome.storage.session.get(["MRU-ID-Cache"]).then((result) => {
    var activeTab = activeInfo.tabId;
    var cache = result.MRU_ID_Cache;
    var index = cache.indexOf(activeTab);
    if (index != -1) {
      cache.splice(index, 1);
    }
    cache.push(activeTab);
    setMRU(cache);
  });
});
