'use strict'

import puppeteer from "puppeteer";
import test from "node:test";
import assert from "node:assert"
import {initializeExtension, sleep} from "../utils.js";

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
            const [tab] = await chrome.tabs.query({"currentWindow": true});
            const window = await chrome.windows.getCurrent();
            await initializeMRU(tab.id, window.id);
            return await getMRU();
        });
        assert.notDeepStrictEqual(cache, {}, "expected a real object result");
        assert.notStrictEqual(cache, undefined, "expected a cache to be found");
        assert.strictEqual(typeof(cache), typeof([]));
        assert.strictEqual(cache.length, 1);
    });

    await t.test('Test Initialization of MRU by trigger', async (t) => {
        const page = await browser.newPage();
        await page.bringToFront();
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
        await service_worker.evaluate(async () => {
            await switch_tab();
        });
        await sleep(100);
        const cache2 = await service_worker.evaluate(async () => {
            return await getMRU();
        });
        assert.strictEqual(cache1[0], cache2[1], "tabs should be swapped");
        assert.strictEqual(cache2[0], cache1[1], "tabs should be swapped");
    });

    await t.test('Test switch tabs via keyboard', async (t) => {
        const page1 = await browser.newPage();
        await page1.bringToFront();
        const page2 = await browser.newPage();
        await page2.goto("https://example.com", {waitUntil: 'domcontentloaded'});
        await page2.bringToFront();

        const cache1 = await service_worker.evaluate(async () => {
            return await getMRU();
        });
        await page2.keyboard.down("Control");
        await page2.keyboard.down("q");
        await sleep(50);
        await page2.keyboard.up("q");
        await sleep(50);
        const preview = await page2.$("#SmarterTabSwitchingPreviewPopupBox");
        console.log(preview);
        assert.notStrictEqual(preview, null);
        await page2.keyboard.up('Control');
        await sleep(100);
        const cache2 = await service_worker.evaluate(async () => {
            return await getMRU();
        });
        assert.strictEqual(cache1[0], cache2[1], "tabs should be swapped");
        assert.strictEqual(cache2[0], cache1[1], "tabs should be swapped");
    });
});

