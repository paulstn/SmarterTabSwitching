// keep an mru cache for every window

const DEBUG = false;

var currentWindow = -1;

async function setMRU(tabs) {
  const result = await chrome.storage.session.get("MRU_ID_Cache");
  var dict = result.MRU_ID_Cache;
  if (dict === undefined) {
    dict = {};
  }
  dict[currentWindow] = tabs;
  await chrome.storage.session.set({ "MRU_ID_Cache": dict });
  if (DEBUG) {
    await logMRU();
  }
}

async function logMRU() {
  const result = await chrome.storage.session.get("MRU_ID_Cache");
  var dict = result.MRU_ID_Cache;
  console.log(dict);
}

async function getMRU() {
  const result = await chrome.storage.session.get("MRU_ID_Cache");
  // if there isn't a cache already set, don't try to query that window
  if (result.MRU_ID_Cache === undefined) {
    return undefined;
  }
  return result.MRU_ID_Cache[currentWindow];
}

async function switch_tab(back_num) {
  // TODO: add parameter checking for back_num? idk javascript
  if (DEBUG) {
    console.log("command triggered");
  }
  const cache = await getMRU();
  // this automatically calls to the tab onActivated callback so we don't
  // need to set the cache to anything here
  await chrome.tabs.update(cache.at(cache.length - 1 - back_num), { active: true, highlighted: true });
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function getWindowTabs(tabWindowId) {
  let queryOptions = { windowId: tabWindowId };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener(async function (command) {
  // the 'switch-tab' command is defined in the manifest
  if (command === "switch-tab") {
    console.log("Chrome.commands: Trying switch");
    let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = tabs[0].url;
    const https = "https://";
    const http = "http://";
    if (url.slice(0, 8) === https || url.slice(0, 8) === http) {
      // send a message to content scripts, q was pressed w/ ctrl
      await chrome.tabs.sendMessage(tabs[0].id, { qPressed: true });
      // immediately switch if we're on a restricted site
    } else {
      console.log("       Restricted Switch Done");
      await switch_tab(1);
    }
  }
});

// Listen for every new tab
chrome.tabs.onActivated.addListener(async function (activeInfo) {
  currentWindow = activeInfo.windowId;
  console.log(currentWindow);
  // need to keep session data stored. otherwise, data will get removed when the service worker
  // gets shut down, which happens if another program is in focus within the device
  var cache = await getMRU();
  if (cache === undefined) {
    // we haven't initialized a cache yet, need to add
    // based on current tab and window
    // the reason we don't do this on session/Chrome startup is
    // because race conditions can still cause the session to get
    // asked for the cache before the cache has been set from the startup handler\
    cache = [];
  }
  if (DEBUG) { console.log(cache); }

  const activeTab = activeInfo.tabId;
  const index = cache.indexOf(activeTab);
  if (index != -1) {
    cache.splice(index, 1);
  }
  cache.push(activeTab);
  await setMRU(cache);
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (DEBUG) { console.log(message); };

  // this should check if the message has the object contentPresses
  if (message.contentPresses) {
    switch_tab(message.contentPresses);
    console.log("Content Scripts: Switched to " + message.contentPresses + " most recently used tab");
  }

  if (message.name == "CTRL+ArrowRight") {
    let tab = getCurrentTab();
    let tabsInWindow = getWindowTabs(tab.windowId);

    let currentIndex = tab.index
    let nextIndex = currentIndex + 1
    if (nextIndex >= tabsInWindow.length) {
      nextIndex = 0;
    }

    let nextTabId = tabsInWindow[nextIndex].tabId;
    chrome.tabs.update(nextTabId, { active: true, highlighted: true });
  }
})