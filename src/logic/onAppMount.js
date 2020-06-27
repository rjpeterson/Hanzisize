/*global chrome*/
import tools from './chromeTools'

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

  // Takes tab info, builds and returns object to be used in setting App state
  helper: async (tabs) => {
    // get active tab info
    const tab = tabs[0];
    // tab object validation
    if(!tab.id) {throw new Error('tab.id not defined')};
    if(!tab.url) {throw new Error('tab.url not defined')}

    if(process.env.NODE_ENV ==='production') {
      console.log(`onAppMount.helper 32 tabId: ${tab.id}, tabUrl: ${tab.url}`)
    };
    // check for invalid urls
    onAppMount.urlChecking(tab);
    // start building responseObject
    const responseObject = {tabId: tab.id};
    // fetch any stored values in chrome.storage
    responseObject.minFontSize = await tools.getFromStorage();

    if(process.env.NODE_ENV ==='production') {
      console.log(`onAppMount 43 didMountObject: ${JSON.stringify(responseObject)}`)
    }

    return responseObject;
  },

  // primary function call when app is mounted
  main: async (_callback) => {
    await chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
      const responseObject = await onAppMount.helper(tabs)
      // callback will set App component state and send to content script
      _callback(responseObject);
    });

  }
}

export default onAppMount;