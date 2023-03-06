'use strict'

import puppeteer from 'puppeteer';
import path from "path";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function initializeExtension() {
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
    // need a small pause to allow chrome to set certain things
    // could play around in the future with exact timing but it seems device specific
    await sleep(100);
    return [browser, service_worker];
}

export async function getActivePage(browser) {
    var pages = await browser.pages();
    var arr = [];
    for (const p of pages) {
        if(await p.evaluate(() => { return document.visibilityState == 'visible' })) {
            arr.push(p);
        }
    }
    if(arr.length == 1) return arr[0];
    throw "Unable to get active page";
}
