'use strict'

import puppeteer from "puppeteer";
import test from "node:test";
import assert from "node:assert"
import {initializeExtension, sleep, getActivePage} from "../utils.js";

var tabs = ["https://example.com", "https://www.google.com", "https://docs.google.com",
            "chrome://newtab", "chrome://extensions", "https://www.nytimes.com",
            "https://www.wikipedia.com", "https://www.irs.gov", "https://domains.google",
            "https://www.dailymail.co.uk/", "https://www.xbox.com/en-US/play"]

test("Top level fuzzer test", async (t) => {
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

    // similar to above but we add opening new tabs to our options.
    // tabs taken from a variety of sources, including ones known not to work
    // We want to ensure that trying commands on places where they won't work will
    // not invalidate the state in any way.
    await t.test("Test Random open and switch tabs", async (t) => {
        var qdown = false;
        var ctrlDown = false;
        const iters = 200;
        for (var i = 0; i < iters; i++) {
            await sleep(5);
            var page = await getActivePage(browser);
            assert.notStrictEqual(page, null);
            var choice = Math.floor(Math.random() * 3);
            if (choice === 0) {
                // toggle q being held down
                if (qdown) {
                    await page.keyboard.up("q");
                    qdown = false;
                } else {
                    await page.keyboard.down('q');
                    qdown = true;
                }
            } else if (choice === 1) {
                // toggle ctrl being held down
                if (ctrlDown) {
                    await page.keyboard.up("Control");
                    ctrlDown = false;
                } else {
                    await page.keyboard.down('Control');
                    ctrlDown = true;
                }
            } else if (choice === 2) {
                var tabChoice = Math.floor(Math.random() * tabs.length);
                var page = await browser.newPage();
                await page.goto(tabs[tabChoice], {waitUntil: 'domcontentloaded'});
                await page.bringToFront();
            }
        }
    });


    // basically just expect no weird breaks
    await t.test("Test Random switch tabs", async (t) => {
        for (var i = 0; i < 100; i++) {
            var page = await browser.newPage();
            await page.goto("https://example.com", {waitUntil: 'domcontentloaded'});
            await page.bringToFront();
        }
        var qdown = false;
        var ctrlDown = false;
        const iters = 1000;
        for (var i = 0; i < iters; i++) {
            await sleep(10);
            var page = await getActivePage(browser);
            assert.notStrictEqual(page, null);
            if (Math.random() >= 0.5) {
                // toggle q being held down
                if (qdown) {
                    await page.keyboard.up("q");
                    qdown = false;
                } else {
                    await page.keyboard.down('q');
                    qdown = true;
                }
            } else {
                // toggle ctrl being held down
                if (ctrlDown) {
                    await page.keyboard.up("Control");
                    ctrlDown = false;
                } else {
                    await page.keyboard.down('Control');
                    ctrlDown = true;
                }
            }
        }
    });
});