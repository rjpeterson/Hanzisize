/*global chrome*/
/*global browser*/
// above are needed for testing
import googlechrome from './browser-specific/googlechrome';
import firefox from './browser-specific/firefox';
import opera from './browser-specific/opera';
import edge from './browser-specific/edge';

import isDevMode from '../utils/isDevMode';

const onAppMount = {
  browserFirefox: firefox,
  browserChrome: googlechrome,
  browserOpera: opera,
  browserEdge: edge,

  // determine user's browser
  userBrowser:  () => {
    if (typeof browser !== 'undefined') {
      if(typeof browser.runtime.getBrowserInfo === 'function') { // user is on firefox
      return 'firefox';
      }
    } else if (onAppMount.browserOpera.operaInfo() === true) { // user is on opera
      return 'opera';
    } else if (onAppMount.browserEdge.edgeInfo() === true) { // user is on edge
      return 'edge';
    } else if (onAppMount.browserChrome.chromeInfo() === true) { // user is on chrome
      return 'chrome';
    } else {
      return 'unknown browser'
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
    } else if (userBrowser === 'edge') {
      return onAppMount.browserEdge.urlChecking(tab);
    } else if (userBrowser === 'chrome') {
      return onAppMount.browserChrome.urlChecking(tab);
    } else {
      return 'user browser unknown. unable to check for valid urls'
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