const puppeteer = require('puppeteer');
const { assert } = require('chai');
const extensionId = require('../extensionId')

const extensionPath = "D:\My Documents\Code\Chrome Extensions\hanzisize-reboot";
const extensionPopupHtml = "popup.html";
let browser = null;

describe('Extension popup', function() {
  this.timeout(20000); // default is 2 seconds and that may not be enough to boot browsers and pages.

  before(async function() {
    await boot();
  });
  after(async function() {
    await browser.close();
  });

  describe('popup content', () => {
    it('displays a number input box', async () => {
      const inputElement = await extensionPage.$('min-font-size');
      assert.ok(inputElement, 'Input field is not rendered');
    })
  })
});

async function boot() {
  const args = puppeteer.defaultArgs().filter(arg => String(arg).toLowerCase() !== '--disable-extensions');
  
  browser = await puppeteer.launch({
    headless: false, // extensions only allowed in head-full mode
    devtools: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '-disable-gpu',
      '--no-first-run',
      '--disable-notifications',
      '--enable-remote-extensions',
      //`--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ] 
  });

  const extensionPage = await browser.newPage();
  await extensionPage.goto(`chrome-extension://${extensionId}/${extensionPopupHtml}`);
};