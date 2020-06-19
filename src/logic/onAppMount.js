/*global chrome*/
import tools from './chromeTools'

const mountCallback = async (tab) => {
  // If minFontSize already stored, set it in the state
  let didMountObject;
  try{
    didMountObject = {tabId: tab.id};
    const storedState = await tools.getFromStorage();
    if (storedState) {
      didMountObject.minFontSize = storedState
    } else {
      didMountObject.minFontSize = null
    };
  }
  catch(err) {console.log(`error at building didMountObject: ${err}`)}

  return didMountObject;
}

const onAppMount = async (_callback) => {
  // URL checking & set tabId
  await chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    const tab = tabs[0];

    if(process.env.NODE_ENV ==='production') {
      console.log(`onAppMount 28 tabId: ${tab.id}, tabUrl: ${tab.url}`)
    };
    
    if(tab.url.match(/^chrome/i)) {
      document.getElementById('error-content').innerHTML = "NOTE: Google blocks extensions and does not allow them to work on special <b>chrome://</b> pages such as the current page.";
    } else if (tab.url.match(/\/webstore/i)) {
      document.getElementById('error-content').innerHTML = "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.";
    }

    const didMountObject =  await mountCallback(tab);
    if(process.env.NODE_ENV ==='production') {
      console.log(`onAppMount 39 didMountObject: ${JSON.stringify(didMountObject)}`)
    };

    _callback(didMountObject);
  });

}

export default onAppMount;