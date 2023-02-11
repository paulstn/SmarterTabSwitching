// keep an mru cache for every window

const DEBUG = true;

async function setMRU(tabs) {
  await chrome.storage.session.set({"MRU_ID_Cache": tabs});
  if (DEBUG) {
    await logMRU();
  }
}

async function logMRU() {
  const cache = getMRU();
  console.log("MRU Cache: " + cache);
}

async function getMRU() {
  const result = await chrome.storage.session.get("MRU_ID_Cache");
  return result.MRU_ID_Cache;
}

async function switch_tab() {
  if (DEBUG) {
    console.log("command triggered");
  }
  const cache = getMRU();
  // this automatically calls to the tab onActivated callback so we don't
  // need to set the cache to anything here
  await chrome.tabs.update(cache.at(cache.length - 2), {active: true, highlighted: true});
}

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener(async function(command) {
  // the 'switch-tab' command is defined in the manifest
  if (command === "switch-tab") {
      await switch_tab();
  }
});

// Listen for every new tab
chrome.tabs.onActivated.addListener(async function(activeInfo) {
  // need to keep session data stored. otherwise, data will get removed when the service worker
  // gets shut down, which happens if another program is in focus within the device
  var cache = getMRU();
  if (cache === undefined) {
    // we haven't initialized a cache yet
    // the reason we don't do this on session/Chrome startup is
    // because race conditions can still cause the session to get
    // asked for the cache before the cache has been set from the startup handler 
    const tabIds = [activeInfo.tabId];
    cache = tabIds;
    await setMRU(tabIds);
  }

  const activeTab = activeInfo.tabId;
  const index = cache.indexOf(activeTab);
  if (index != -1) {
    cache.splice(index, 1);
  }
  cache.push(activeTab);
  await setMRU(cache);
});
