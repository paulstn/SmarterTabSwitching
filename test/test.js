'use strict'

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://news.ycombinator.com', {
      waitUntil: 'networkidle2',
    });
    
    const three = await page.evaluate(() => {
        return 1 + 2;
    });

    if (three !== 3) {
        console.error("error");
    } else {
        console.log("success");
    }
    
  
    await browser.close();
  })();
