const opera = {// opera specific url checking
  chromeErrorString: "NOTE: Opera blocks extensions and does not allow them to work on special settings pages such as the current page.",
  addonsErrorString: "NOTE: For this addon to work you must leave addons.opera.com and go to another website. Opera blocks addons from functioning on special pages such as this one.",

  // determines if the user is on Opera or not
  isOpera: () => {
    try { // if no regex match = user not on Chrome
      return (navigator.userAgent.match(/Opera|OPR\//) ? true : false);
    } catch (error) { // returns false if navigator.userAgent is not found
      return null;
    }
  },

  // addons are not allowed on addons.mozilla.org or settings pages. This function checks for these urls
  urlInvalid: (tab) => {
    if ('url' in tab) {
      if (tab.url.match(/\/addons\.opera\.com/i)) {
        return opera.addonsErrorString;
      } else if(tab.url.match(/^chrome/i)) {
        return opera.chromeErrorString;
      } else {
        return false
      }
    } else {
      throw new Error('Active tab has no url value')
    }
  }
}

export default opera;