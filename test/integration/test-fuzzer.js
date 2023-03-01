'use strict'

import puppeteer from "puppeteer";
import test from "node:test";
import assert from "node:assert"
import {initializeExtension, sleep} from "../utils.js";
import { randomBytes, randomInt } from "node:crypto";

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
        var buffer = randomBytes(iters);
        for (var i = 0; i < iters; i++) {
            await sleep(5);
            var page = null;
            var found = false;
            for (const p of await browser.pages()) {
                // find active page
                if(!found && await p.evaluate(() => document.visibilityState == 'visible')) {
                    page = p;
                    found = true;
                }
            }
            assert.notStrictEqual(page, null);
            var choice = buffer.at(i) % 2;
            if (choice === 0) {
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