const puppeteer = require('puppeteer');
const extensionInfo = require('../extensionInfo');

// launches test browser, loads extension, and navigates to popuphtml
const pupBrowser = {
  extensionPage: null,
  testTextPage: null,
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

    // load page with text to test
    this.testTextPage = await this.browser.newPage();
    await this.testTextPage.goto('D:/My Documents/Code/Chrome Extensions/hanzisize-reboot/test/testpage.html');

    // load extension popup
    this.extensionPage = await this.browser.newPage();
    await this.extensionPage.goto(`chrome-extension://${extensionInfo.id}/${extensionInfo.popupHtml}`);

    // focus on extension popup
    await this.extensionPage.bringToFront();
    // this.blockingWait(1);
  },

  blockingWait(seconds) {
    //simple blocking technique (wait...)
    var waitTill = new Date(new Date().getTime() + seconds * 1000);
    while(waitTill > new Date()){}
  }
}


module.exports = pupBrowser;