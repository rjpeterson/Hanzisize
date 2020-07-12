/*global chrome*/
import tools from './chromeTools'
function isDevMode() {
  if(process.env.NODE_ENV === "test") {return true}
  else {return !('update_url' in chrome.runtime.getManifest());}  
}

const onAppMount = {
  chromeErrorString: "NOTE: Google blocks extensions and does not allow them to work on special <b>chrome://</b> pages such as the current page.",
  webstoreErrorString: "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.",

  urlChecking: (tab) => {
    let returnString;
    // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
    if(tab.url.match(/^chrome/i)) {
      document.getElementById('error-content').innerHTML = onAppMount.chromeErrorString;
      returnString = 'invalid URL';
    } else if (tab.url.match(/\/webstore/i)) {
      document.getElementById('error-content').innerHTML = onAppMount.webstoreErrorString;
      returnString = 'invalid URL';
    } else {
      returnString = 'valid URL'
    }
    return returnString;
  },

  // gets, validates, and returns current tab id
  main: (_callback) => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
      // get active tab info
      const tab = tabs[0];
      if(isDevMode()) {console.log(`onAppMount.helper ${JSON.stringify(tab)}`)}
      // tab object validation
      if(!tab.id) {throw new Error('tab.id not defined')};
      if(!tab.url) {throw new Error('tab.url not defined')}
      // check for invalid urls
      onAppMount.urlChecking(tab);
      const tabId = tab.id;
      if(isDevMode()) {console.log(`onAppMount.main tabId: ${tabId}`)}
      _callback(tabId);
    });
  }
}

export default onAppMount;