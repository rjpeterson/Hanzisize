/*global chrome*/
function isDevMode() {
  if(process.env.NODE_ENV === "test") {return true}
  else {return !('update_url' in chrome.runtime.getManifest());}  
}

const onAppMount = {
  chromeErrorString: "NOTE: Google blocks extensions and does not allow them to work on special <chrome://> pages such as the current page.",
  webstoreErrorString: "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.",

  urlChecking: (tab) => {
    let returnString;
    // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
    if(tab.url.match(/^chrome/i)) {
      returnString = onAppMount.chromeErrorString;
    } else if (tab.url.match(/\/webstore/i)) {
      returnString = onAppMount.webstoreErrorString;
    } else {
      returnString = 'valid URL'
    }
    return returnString;
  },

  // gets and validates current tab.id and gets url validity string, sends both to callback
  main: (_callback) => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
      // get active tab info
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