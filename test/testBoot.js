const puppeteer = require('puppeteer');
const extensionInfo = require('../extensionInfo');

// launches test browser, loads extension, and navigates to popuphtml
const pupBrowser = {
  extensionPage: null,
  browser: null,

  // launches browser, navigates to Extension popup, and returns browser object
  async launchBrowser() {
    try {
        this.browser = await puppeteer.launch({
        headless: false, // extensions only allowed in head-full mode
        devtools: true,
        ignoreDefaultArgs: true,
        args: [
          // '--no-sandbox',
          // '--disable-setuid-sandbox',
          // '-disable-gpu',
          // '--no-first-run',
          // '--disable-notifications',
          '--enable-remote-extensions',
          `--disable-extensions-except=${extensionInfo.path}`,
          `--load-extension=${extensionInfo.path}`
        ]
      });
    } 
    catch(err) {
      console.log(err)
    }

    this.extensionPage = await this.browser.newPage();
    await this.extensionPage.goto(`chrome-extension://${extensionInfo.id}/${extensionInfo.popupHtml}`);
  },
}


module.exports = pupBrowser;