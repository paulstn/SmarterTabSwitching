'use strict'

import puppeteer from "puppeteer";
import test from "node:test";
import assert from "node:assert"
import {initializeExtension, sleep, CreateNewWindowPage} from "../utils.js";

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

    await t.test("Test manual Initialization of MRU", async (t) => {
        const cache = await service_worker.evaluate(async () => {
            await setMRU([1]);
            return await getMRU();
        });
        assert.notDeepStrictEqual(cache, {}, "expected a real object result");
        assert.notStrictEqual(cache, undefined, "expected a cache to be found");
        assert.deepStrictEqual(cache, [1]);
    });

    await t.test('Test Initialization of MRU by trigger', async (t) => {
        const page = await browser.newPage();
        await page.bringToFront();
        await sleep(100);
        const cache = await service_worker.evaluate(async () => {
            return await getMRU();
        });
        assert.strictEqual(typeof(cache), typeof([]));
        assert.strictEqual(cache.length, 1, "expect one tab currently in the cache");
    });

    await t.test('Test Initialization of MRU with 2 tabs', async (t) => {
        const page1 = await browser.newPage();
        await page1.bringToFront();
        const page2 = await browser.newPage();
        await page2.bringToFront();
        const cache = await service_worker.evaluate(async () => {
            return await getMRU();
        });
        assert.strictEqual(cache.length, 2, "expect two tabs currently in the cache");
    });

    // can't utilize keyboard shortcuts to test tab switching but can just call the method
    await t.test('Test switch tabs', async (t) => {
        const page1 = await browser.newPage();
        await page1.bringToFront();
        const page2 = await browser.newPage();
        await page2.bringToFront();

        const cache1 = await service_worker.evaluate(async () => {
            return await getMRU();
        });
        // for some reason if we put this call in the block where we get cache2, it fails
        // I think it's a timing thing and sending the eval request takes long enough
        // so that the new tab listener triggers.
        await sleep(100);
        await service_worker.evaluate(async () => {
            await switch_tab(1);
        });
        await sleep(100);
        const cache2 = await service_worker.evaluate(async () => {
            return await getMRU();
        });
        assert.strictEqual(cache1[0], cache2[1], "tabs should be swapped");
        assert.strictEqual(cache2[0], cache1[1], "tabs should be swapped");
    });

    // Not sure how to add more than 1 tab to a window but this at least make sure we're tracking
    // tabs across all windows
    await t.test("Test Multiple Windows MRU", async (t) => {
        const page1 = await browser.newPage();
        await page1.bringToFront();
        const page2 = await browser.newPage();
        await page2.bringToFront();
        const window1Id = await service_worker.evaluate(async () => {
            return currentWindow;
        });

        const page3 = await CreateNewWindowPage(browser);
        await page3.bringToFront();
        const window2Id = await service_worker.evaluate(async () => {
            return currentWindow;
        });
        // creates tab in old window (same as pages 1 and 2)
        const page4 = await browser.newPage();
        await page4.bringToFront();

        var MRUDict = await service_worker.evaluate(async () => {
            return await chrome.storage.session.get("MRU_ID_Cache");
        });
        
        await service_worker.evaluate(async () => {
            await switch_tab(1);
        });
        await sleep(100);
        const cacheNew = await service_worker.evaluate(async () => {
            return await getMRU();
        });
        MRUDict = MRUDict.MRU_ID_Cache;
        const cacheOld = MRUDict[window1Id.toString()];
        assert.strictEqual(typeof(cacheOld), typeof([]));
        assert.strictEqual(cacheOld.length, 3);
        const cacheWindow2 = MRUDict[window2Id.toString()];
        assert.strictEqual(typeof(cacheWindow2), typeof([]));
        assert.strictEqual(cacheWindow2.length, 1);

        assert.strictEqual(cacheOld[2], cacheNew[1], "tabs should be swapped");
        assert.strictEqual(cacheNew[2], cacheOld[1], "tabs should be swapped");
        assert.strictEqual(cacheNew[0], cacheOld[0], "This tab should be unchanged");
    });
});

