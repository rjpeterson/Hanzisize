const googlechrome = {// chrome specific url checking
  chromeErrorString: "NOTE: Google blocks extensions and does not allow them to work on special <chrome://> pages such as the current page.",
  webstoreErrorString: "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.",

  isChrome: () => {
    try { // no regex match means user not on Chrome
      return (navigator.userAgent.match(/Chrome\//) ? true : false);
    } catch (error) { // returns false if navigator.userAgent is not found, user not using chrome-based browser
      return false;
    }
  },

  urlValid: (tab : chrome.tabs.Tab) => {
    // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
    let result = {
      message: '',
      valid: false
    }
    if ('url' in tab) {
      if(tab.url?.match(/^chrome/i)) {
        result.message = googlechrome.chromeErrorString;
      } else if (tab.url?.match(/chrome\.google.com\/webstore/i)) {
        result.message = googlechrome.webstoreErrorString;
      } else {
        result.valid = true;
      }
    } else {
      throw new Error('Active tab has no url value')
    }
    return result
  },
}

export default googlechrome;