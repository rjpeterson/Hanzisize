const edge = {// chrome specific url checking
  edgeErrorString: "NOTE: Microsoft blocks extensions and does not allow them to work on special <edge://> pages such as the current page.",
  addonsErrorString: "NOTE: For this extension to work you must leave the Edge Addons store and go to another website. Microsoft blocks extensions from functioning on special pages such as this one.",

  // determines if the user is on Chrome or not
  edgeInfo: () => {
    try { // if no regex match = user not on Chrome
      // return /Chrome\/([0-9.]+)/.exec(window.navigator.userAgent)[0];
      return (navigator.userAgent.match(/Edg\//) ? true : false);
    } catch (error) { // returns false if navigator.userAgent is not found
      return null;
    }
  },

  urlChecking: (tab) => {
    // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
    if ('url' in tab) {
      if(tab.url.match(/^edge/i)) {
        return edge.edgeErrorString;
      } else if (tab.url.match(/microsoftedge\.microsoft\.com\/addons/i)) {
        return edge.addonsErrorString;
      } else {
        return 'valid URL'
      }
    } else {
      throw new Error('Active tab has no url value')
    }
  },
}

export default edge;