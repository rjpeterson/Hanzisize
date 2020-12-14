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

  urlInvalid: (tab) => {
    // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
    if ('url' in tab) {
      if(tab.url.match(/^chrome/i)) {
        return googlechrome.chromeErrorString;
      } else if (tab.url.match(/chrome\.google.com\/webstore/i)) {
        return googlechrome.webstoreErrorString;
      } else {
        return false;
      }
    } else {
      throw new Error('Active tab has no url value')
    }
  },
}

export default googlechrome;