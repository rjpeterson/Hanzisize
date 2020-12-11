/*global chrome*/
// above needed for testing
import googlechrome from './browser-specific/googlechrome';
import firefox from './browser-specific/firefox';
import opera from './browser-specific/opera';
import edge from './browser-specific/edge';

import devLog from '../utils/devLog';

const onAppMount = {
  browserFirefox: firefox,
  browserChrome: googlechrome,
  browserOpera: opera,
  browserEdge: edge,

  // determine user's browser
  userBrowser:  () => {
    if (onAppMount.browserFirefox.isFirefox() === true) {// user is on firefox
      return 'firefox';
    } else if (onAppMount.browserOpera.isOpera() === true) { // user is on opera
      return 'opera';
    } else if (onAppMount.browserEdge.isEdge() === true) { // user is on edge
      return 'edge';
    } else if (onAppMount.browserChrome.isChrome() === true) { // user is on chrome
      return 'chrome';
    } else {
      return false;
    }
  },

  // check for disallowed urls by browser
  urlInvalid: (tab) => {
    const userBrowser = onAppMount.userBrowser();
    devLog(`onAppMount.urlChecking userBrowser is: ${userBrowser}`)
    if (userBrowser === 'firefox') {
      return onAppMount.browserFirefox.urlInvalid(tab);
    } else if (userBrowser === 'opera') {
      return onAppMount.browserOpera.urlInvalid(tab);
    } else if (userBrowser === 'edge') {
      return onAppMount.browserEdge.urlInvalid(tab);
    } else if (userBrowser === 'chrome') {
      return onAppMount.browserChrome.urlInvalid(tab);
    } else {
      return false
    }
  },

  // gets and validates current tab.id and gets url validity string, sends both to callback
  main: async () => {

    // get active tab info
    const getQueryResult = () => {
      return new Promise(resolve => {
        chrome.tabs.query({active: true, currentWindow: true}, response => resolve(response))
      }) 
      // chrome.tabs.query({active: true, currentWindow: true}, (result) => {return result});
    }

    const tabs = await getQueryResult()
    const tab = await tabs[0];

    devLog(`onAppMount.main tab ${JSON.stringify(tab)}`)
    // tab object validation
    if(!tab.id) {throw new Error('tab.id not defined')};
    if(!tab.url) {throw new Error('tab.url not defined')}
    
    // check browser
    const validBrowser = onAppMount.userBrowser();
    // check url
    const invalidUrl = onAppMount.urlInvalid(tab);
    return {
      tabId: tab.id, 
      validBrowser: validBrowser,
      invalidUrl: invalidUrl
    };
  }
}

export default onAppMount;