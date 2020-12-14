/*global chrome*/
// above needed for testing
import googlechrome from './browser-specific/googlechrome';
import firefox from './browser-specific/firefox';
import opera from './browser-specific/opera';
import edge from './browser-specific/edge';

import devLog from '../utils/devLog';

const onAppMount = {

  // determine user's browser
  userBrowser:  () => {
    if (firefox.isFirefox() === true) {// user is on firefox
      return 'firefox';
    } else if (opera.isOpera() === true) { // user is on opera
      return 'opera';
    } else if (edge.isEdge() === true) { // user is on edge
      return 'edge';
    } else if (googlechrome.isChrome() === true) { // test googlechrome last because the above browsers' useragent strings also contain the string "Chrome"
      return 'chrome';
    } else {
      return false;
    }
  },

  // check for disallowed urls by browser
  urlInvalid: (tab, browser) => {
    let result;
    switch(browser) {
      case 'firefox':
        result = firefox.urlInvalid(tab)
        break;
      case 'opera':
        result = opera.urlInvalid(tab)
        break;
      case 'edge':
        result = edge.urlInvalid(tab)
        break;
      case 'chrome':
        result = googlechrome.urlInvalid(tab);
        break;
      default:
        result = true;
    }
    return result;
  },

  // gets and validates current tab.id and gets url validity string, sends both to callback
  main: async () => {

    // get active tab info
    const getQueryResult = () => {
      return new Promise(resolve => {
        chrome.tabs.query({active: true, currentWindow: true}, response => resolve(response))
      }) 
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
    const invalidUrl = onAppMount.urlInvalid(tab, validBrowser);
    return {
      tabId: tab.id, 
      validBrowser: validBrowser,
      invalidUrl: invalidUrl
    };
  }
}

export default onAppMount;