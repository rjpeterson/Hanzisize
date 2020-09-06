/*global chrome*/
/*global browser*/
// above are needed for testing

// update_url is set by chrome webstore on submit. If it doesn't exist, the extension was loaded locally rather than installed from webstore
function isDevMode() {
  if(process.env.NODE_ENV === "test") {return true}
  else {return !('update_url' in chrome.runtime.getManifest());}  
}

const onAppMount = {
  browserFirefox: {// firefox specific url checking
    addonsErrorString: "NOTE: For this addon to work you must leave addons.mozilla.org and go to another website. Mozilla blocks addons from functioning on special Mozilla pages such as this one.",
    aboutErrorString: "NOTE: For this addon to work you must leave this page and go to another website. Mozilla blocks addons from functioning on special Firefox pages such as this one.",

    // addons are not allowed on addons.mozilla.org or settings pages. This function checks for these urls
    urlChecking: (tab) => {
      let returnString;

      if (tab.url.match(/\/addons\.mozilla\.org/i)) {
        returnString = onAppMount.browserFirefox.addonsErrorString;
      } else if (tab.url.match(/^about:/i)) {
        returnString = onAppMount.browserFirefox.aboutErrorString;
      } else {
        returnString = 'valid URL'
      }
      return returnString;
    }
  },

  browserChrome: {// chrome specific url checking
    chromeErrorString: "NOTE: Google blocks extensions and does not allow them to work on special <chrome://> pages such as the current page.",
    webstoreErrorString: "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.",

    // determines if the user is on Chrome or not
    chromeInfo: () => {
      try { // if no regex match = user not on Chrome
        return /Chrome\/([0-9.]+)/.exec(window.navigator.userAgent)[0];
      } catch (error) { // returns false if navigator.userAgent is not found
        return null;
      }
    },
  
    urlChecking: (tab) => {
      let returnString;
      // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
      if(tab.url.match(/^chrome/i)) {
        returnString = onAppMount.browserChrome.chromeErrorString;
      } else if (tab.url.match(/\/webstore/i)) {
        returnString = onAppMount.browserChrome.webstoreErrorString;
      } else {
        returnString = 'valid URL'
      }
      return returnString;
    },
  },

  // determine user's browser
  userBrowser:  () => {
    if (typeof browser !== 'undefined') {
      if(typeof browser.runtime.getBrowserInfo === 'function') { // user is on firefox
      return 'firefox';
      }
    } else if (onAppMount.browserChrome.chromeInfo() !== null) { // user is on chrome
      return 'chrome';
    } else {
      return 'none'
    }
  },

  // check for disallowed urls by browser
  urlChecking: (tab) => {
    let returnString;
    const userBrowser = onAppMount.userBrowser();
    if (userBrowser === 'firefox') {
      returnString = onAppMount.browserFirefox.urlChecking(tab);
    } else if (userBrowser === 'chrome') {
      returnString = onAppMount.browserChrome.urlChecking(tab);
    }
    return returnString;
  },

  // gets and validates current tab.id and gets url validity string, sends both to callback
  main: (_callback) => {

    // get active tab info
    chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
      const tab = tabs[0];
      if(isDevMode()) {console.log(`onAppMount.main tab ${JSON.stringify(tab)}`)}

      // tab object validation
      if(!tab.id) {throw new Error('tab.id not defined')};
      if(!tab.url) {throw new Error('tab.url not defined')}
      
      // check for invalid urls
      const urlValidityMessage = onAppMount.urlChecking(tab);
      const tabId = tab.id;
      if(isDevMode()) {console.log(`onAppMount.main tabId: ${tabId}`)}
      _callback(tabId, urlValidityMessage);
    });
  }
}

export default onAppMount;