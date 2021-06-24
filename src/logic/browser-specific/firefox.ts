/*global browser*/
// above needed for testing

const firefox = {// firefox specific url checking
  addonsErrorString: "NOTE: For this addon to work you must leave addons.mozilla.org and go to another website. Mozilla blocks addons from functioning on special Mozilla pages such as this one.",
  aboutErrorString: "NOTE: For this addon to work you must leave this page and go to another website. Mozilla blocks addons from functioning on special Firefox pages such as this one.",

  isFirefox: () => {
    // @ts-ignore
    if (typeof browser !== 'undefined') {
      // @ts-ignore
      if(typeof browser.runtime.getBrowserInfo === 'function') { // user is on firefox
        return true;
      } else { 
        return false;
      }
    }
  },

  // addons are not allowed on addons.mozilla.org or settings pages. This function checks for these urls
  urlValid: (tab : chrome.tabs.Tab) => {
    let result = {
      message: '',
      valid: false
    }
    if ('url' in tab) {
      if (tab.url?.match(/\/addons\.mozilla\.org/i)) {
        result.message = firefox.addonsErrorString;
      } else if (tab.url?.match(/^about:/i)) {
        result.message = firefox.aboutErrorString;
      } else {
        result.valid = true
      }
    } else {
      throw new Error('Active tab has no url value')
    }
    return result;
  }
}

export default firefox;