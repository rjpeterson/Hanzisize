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
      if ('url' in tab) {
        if (tab.url.match(/\/addons\.mozilla\.org/i)) {
          return onAppMount.browserFirefox.addonsErrorString;
        } else if (tab.url.match(/^about:/i)) {
          return onAppMount.browserFirefox.aboutErrorString;
        } else {
          return 'valid URL'
        }
      } else {
        throw new Error('Active tab has no url value')
      }
    }
  },

  browserChrome: {// chrome specific url checking
    chromeErrorString: "NOTE: Google blocks extensions and does not allow them to work on special <chrome://> pages such as the current page.",
    webstoreErrorString: "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.",

    // determines if the user is on Chrome or not
    chromeInfo: () => {
      try { // if no regex match = user not on Chrome
        // return /Chrome\/([0-9.]+)/.exec(window.navigator.userAgent)[0];
        return (navigator.userAgent.match(/Chrome\//) ? true : false);
      } catch (error) { // returns false if navigator.userAgent is not found
        return null;
      }
    },
  
    urlChecking: (tab) => {
      // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
      if ('url' in tab) {
        if(tab.url.match(/^chrome/i)) {
          return onAppMount.browserChrome.chromeErrorString;
        } else if (tab.url.match(/\/webstore/i)) {
          return onAppMount.browserChrome.webstoreErrorString;
        } else {
          return 'valid URL'
        }
      } else {
        throw new Error('Active tab has no url value')
      }
    },
  },

  browserOpera: {// opera specific url checking
    addonsErrorString: "NOTE: For this addon to work you must leave addons.opera.com and go to another website. Opera blocks addons from functioning on special pages such as this one.",

    // determines if the user is on Opera or not
    operaInfo: () => {
      try { // if no regex match = user not on Chrome
        return (navigator.userAgent.match(/Opera|OPR\//) ? true : false);
      } catch (error) { // returns false if navigator.userAgent is not found
        return null;
      }
    },

    // addons are not allowed on addons.mozilla.org or settings pages. This function checks for these urls
    urlChecking: (tab) => {
      if ('url' in tab) {
        if (tab.url.match(/\/addons\.opera\.com/i)) {
          return onAppMount.browserOpera.addonsErrorString;
        } else {
          return 'valid URL'
        }
      } else {
        throw new Error('Active tab has no url value')
      }
    }
  },

  // determine user's browser
  userBrowser:  () => {
    if (typeof browser !== 'undefined') {
      if(typeof browser.runtime.getBrowserInfo === 'function') { // user is on firefox
      return 'firefox';
      }
    } else if (onAppMount.browserOpera.operaInfo() === true) { // user is on opera
      return 'opera';
    } else if (onAppMount.browserChrome.chromeInfo() === true) { // user is on chrome
      return 'chrome';
    } else {
      throw new Error("User's browser cannot be determined.")
    }
  },

  // check for disallowed urls by browser
  urlChecking: (tab) => {
    const userBrowser = onAppMount.userBrowser();
    if (isDevMode()) {
      console.log(`onAppMount.urlChecking userBrowser is: ${userBrowser}`)
    }
    if (userBrowser === 'firefox') {
      return onAppMount.browserFirefox.urlChecking(tab);
    } else if (userBrowser === 'opera') {
      return onAppMount.browserOpera.urlChecking(tab);
    } else if (userBrowser === 'chrome') {
      return onAppMount.browserChrome.urlChecking(tab);
    } else {
      throw new Error('user browser is not compatible. urlChecking failed')
    }
  },

  // gets and validates current tab.id and gets url validity string, sends both to callback
  main: (_callback) => {

    // get active tab info
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
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