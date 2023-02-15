'use strict'

import puppeteer from 'puppeteer';
import test from 'node:test';
import assert from 'node:assert';

test('basic test', async (t) => {
    assert.strictEqual(1 + 2, 3, 'expected 3');
});

test('test puppeteer javascript Eval', async (t) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://news.ycombinator.com', {
      waitUntil: 'networkidle2',
    });
    
    const three = await page.evaluate(() => {
        return 1 + 2;
    });

    assert.strictEqual(three, 3, "expected to get 3");
    
  
    await browser.close();
  });
