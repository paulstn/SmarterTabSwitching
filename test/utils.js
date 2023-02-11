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
        slowMo: 500,
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
