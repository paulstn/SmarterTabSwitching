'use strict'

const puppeteer = require('puppeteer');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert');

async function initializeExtension() {
    const pathToExtension = path.join(process.cwd(), 'src');
    const browser = await puppeteer.launch({
        headless: false,
        // uncomment for trying to actually see what puppeteer is doing
        // or if there could be race conditions
        // if there are race conditions, put a sleep in the code instead of leaving it on
        //slowMo: 500,
        args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        ],
    });
    const serviceWorkerTarget = await browser.waitForTarget(
        target => target.type() === 'service_worker'
    );
    const service_worker = await serviceWorkerTarget.worker();
    await sleep(250);
    return [browser, service_worker];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("Top level extension test", async (t) => {
    // can comment this out and just have
    // var browser;
    // but this line gives type hinting
    var browser = await puppeteer.launch(); await browser.close();
    var service_worker;
    t.beforeEach(async (t) => {
        [browser, service_worker] = await initializeExtension();
    });
    t.afterEach(async (t) => {
        await browser.close();
    });

    await t.test("Test Chrome Tabs", async (t) => {
        const page = await browser.newPage();
        const result = await service_worker.evaluate(async () => {
            return await chrome.tabs.query({"currentWindow": true});
        });
        assert.strictEqual(result.length, 2, "there should be two tabs open");
        assert.strictEqual(result[0].index, 0, "index should be in straightforward order");
    });
    
    await t.test("Test Get/Set MRU", async (t) => {
        const result = await service_worker.evaluate(async () => {
            const [tab] = await chrome.tabs.query({"currentWindow": true});
            await setMRU([tab.id]);
            return chrome.storage.session.get("MRU_ID_Cache");
        });
        assert.notDeepStrictEqual(result, {}, "expected a real object result");
        const cache = result.MRU_ID_Cache;
        assert.notStrictEqual(cache, undefined, "expected a cache to be found");
        assert.strictEqual(typeof(cache), typeof([]));
        assert.strictEqual(cache.length, 1);
    });

    await t.test('Test Initialization of MRU', async (t) => {
        const page = await browser.newPage();
        await page.bringToFront();
        const result = await service_worker.evaluate(async () => {
            return chrome.storage.session.get("MRU_ID_Cache");
        });
        const cache = result.MRU_ID_Cache;
        assert.strictEqual(cache.length, 1, "expect one tab currently in the cache");
    });

    await t.test('Test Initialization of MRU with 2 tabs', async (t) => {
        const page1 = await browser.newPage();
        await page1.bringToFront();
        const page2 = await browser.newPage();
        await page2.bringToFront();
        const result = await service_worker.evaluate(async () => {
            return chrome.storage.session.get("MRU_ID_Cache");
        });
        const cache = result.MRU_ID_Cache;
        assert.strictEqual(cache.length, 2, "expect two tabs currently in the cache");
    });

    await t.test('Test switch tabs', {skip: "can't correctly trigger the shortcut"}, async (t) => {
        const page1 = await browser.newPage();
        await page1.bringToFront();
        const page2 = await browser.newPage();
        await page2.bringToFront();
        const result = await service_worker.evaluate(async () => {
            return chrome.storage.session.get("MRU_ID_Cache");
        });
        const [tab1a, tab2a] = result.MRU_ID_Cache;
        await page2.keyboard.press('0', {commands: ["switch-tab"]});
        sleep(250);
        const result2 = await service_worker.evaluate(async () => {
            return chrome.storage.session.get("MRU_ID_Cache");
        });
        const [tab1b, tab2b] = result2.MRU_ID_Cache;
        console.log([tab1a, tab2a, tab1b, tab2b]);
        assert.strictEqual(tab1a, tab2b, "tabs should be swapped");
        assert.strictEqual(tab2a, tab1b, "tabs should be swapped");
    });
});

