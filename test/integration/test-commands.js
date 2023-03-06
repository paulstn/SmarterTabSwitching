'use strict'

import puppeteer from "puppeteer";
import test from "node:test";
import assert from "node:assert"
import {initializeExtension, sleep, getActivePage} from "../utils.js";

test("Extension command to functionality test", async (t) => {
    var browser = await puppeteer.launch(); await browser.close();
    var service_worker;
    t.beforeEach(async (t) => {
        [browser, service_worker] = await initializeExtension();
    });
    t.afterEach(async (t) => {
        await browser.close();
    });

    await t.test("Test content-script Single Switching", {skip: "non finished"}, async (t) => {
        const page1 = await browser.newPage();
        await page1.bringToFront();
        await page2.goto("chrome://extensions/", {waitUntil: 'domcontentloaded'});
        const page2 = await browser.newPage();
        await page2.bringToFront();
        await page2.goto("chrome://extensions/", {waitUntil: 'domcontentloaded'});

        assert.notStrictEqual(await getActivePage(browser), page1, "expected us to be on page 2");
        assert.strictEqual(await getActivePage(browser), page2, "expected us to be on page 2");

        await page2.keyboard.down("Control");

        await sleep(100);

        await page2.keyboard.down("KeyQ");

        await sleep(100);

        await page2.keyboard.up('Control');

        await sleep(100);

        await page2.keyboard.up("KeyQ");

        await sleep(100);

        assert.strictEqual(await getActivePage(browser), page1, "we don't end on page 1");
    });
    
    await t.test("Test content-script single Multiple Switching", async (t) => {
        const page1 = await browser.newPage();
        await page1.bringToFront();
        const page2 = await browser.newPage();
        await page2.goto("https://example.com", {waitUntil: 'domcontentloaded'});
        await page2.bringToFront();

        assert.notStrictEqual(await getActivePage(browser), page1, "expected us to be on page 2");
        assert.strictEqual(await getActivePage(browser), page2, "expected us to be on page 2");

        await page2.keyboard.down("Control");

        await sleep(100);

        await page2.keyboard.down("KeyQ");

        await sleep(100);

        await page2.keyboard.up("KeyQ");

        await sleep(100);

        await page2.keyboard.up('Control');

        await sleep(100);

        assert.strictEqual(await getActivePage(browser), page1, "we don't end on page 1");
    });

    // await t.test("Test content-script multiple Multiple Switching");

    await t.test("Test Restricted Tab Switching", {skip: "non finished"}, async (t) => {
        const page1 = await browser.newPage();
        await page1.bringToFront();
        const page2 = await browser.newPage();
        await page2.bringToFront();

        assert.notStrictEqual(await getActivePage(browser), page1, "expected us to be on page 2");
        assert.strictEqual(await getActivePage(browser), page2, "expected us to be on page 2");

        await page2.keyboard.down("Control");

        await sleep(100);

        await page2.keyboard.down("KeyQ");

        await sleep(100);

        await page2.keyboard.up("KeyQ");

        await sleep(100);

        await page2.keyboard.up('Control');

        await sleep(100);

        assert.strictEqual(await getActivePage(browser), page1, "we don't end on page 1");
    });

    // await t.test("Test Webpage-Dialogue-Open Switching");

    // /**
    //  * "slipping" is an issue that can occur between restricted tabs and regular content-script
    //  * tabs. What occurs is the mixture between a command being listened to and registered on
    //  * one side and then again being listened to and registered on the other side, so what 
    //  * ultimately happens looks like a slip or a bounce
    //  */
    // await t.test("Test Slip Switching");
});