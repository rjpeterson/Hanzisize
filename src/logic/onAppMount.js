/*global chrome*/
/*global browser*/
// above are needed for testing
import googlechrome from './browser-specific/googlechrome';
import firefox from './browser-specific/firefox';
import opera from './browser-specific/opera';

// update_url is set by chrome webstore on submit. If it doesn't exist, the extension was loaded locally rather than installed from webstore
function isDevMode() {
  if(process.env.NODE_ENV === "test") {return true}
  else {return !('update_url' in chrome.runtime.getManifest());}  
}

const onAppMount = {
  browserFirefox: firefox,

  browserChrome: googlechrome,

  browserOpera: opera,

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