const firefox = {// firefox specific url checking
  addonsErrorString: "NOTE: For this addon to work you must leave addons.mozilla.org and go to another website. Mozilla blocks addons from functioning on special Mozilla pages such as this one.",
  aboutErrorString: "NOTE: For this addon to work you must leave this page and go to another website. Mozilla blocks addons from functioning on special Firefox pages such as this one.",

  // addons are not allowed on addons.mozilla.org or settings pages. This function checks for these urls
  urlChecking: (tab) => {
    if ('url' in tab) {
      if (tab.url.match(/\/addons\.mozilla\.org/i)) {
        return firefox.addonsErrorString;
      } else if (tab.url.match(/^about:/i)) {
        return firefox.aboutErrorString;
      } else {
        return 'valid URL'
      }
    } else {
      throw new Error('Active tab has no url value')
    }
  }
}

export default firefox;