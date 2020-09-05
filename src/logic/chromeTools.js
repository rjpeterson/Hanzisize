/*global chrome*/
function isDevMode() {
  if(process.env.NODE_ENV === "test") {return true}
  else {return !('update_url' in chrome.runtime.getManifest());}  
}

const tools = {
  // push submitted fontsize to chrome local storage
  pushFSToStorage: (minFontSize) => {
    chrome.storage.local.set({minFontSize: minFontSize}, () => {
      if (isDevMode()) console.log(`New minimum font size stored as: ${minFontSize}`)
    })
  },  
  
  // push submitted language to chrome local storage
  pushLangToStorage: (language) => {
    chrome.storage.local.set({language: language}, () => {
      if (isDevMode()) console.log(`New language stored as: ${language}`)
    })
  },

  // return minFontSize from chrome local storage if exists
  getFromStorage: (_callback) => {
    chrome.storage.local.get(['minFontSize', 'language'], (result) => {
      if(result.minFontSize && result.language) {
        if (isDevMode()) {
          console.log(`chromeTools.getFromStorage 19 Retrieved object from storage: ${JSON.stringify(result)}`)
        };
      } else if(!result.minFontSize) {
        if (isDevMode()) console.log('result.minFontSize not found');
      } else {
        if (isDevMode()) console.log('result.language not found');
      }
      _callback(result);
    })
  },

  sendToContent: (tab_id, obj) => {
  
    // try to send object to content script
    chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {
      if(chrome.runtime.lastError && !response) {
        // Try to inject jquery into active tab, if this returns an error, the user is probably trying to use the extension on a page that the browser doesn't allow (e.g. chrome webstore, addons.mozilla.org, etc.)
          chrome.tabs.executeScript(tab_id, {file: process.env.PUBLIC_URL + 'jquery-3.5.1.slim.min.js'}, function() {
            if(chrome.runtime.lastError) {
              if (isDevMode()) console.error(chrome.runtime.lastError.message);
              throw new Error('script cannot be injected. likely missing host permission')
            } else {
              // Inject content.js in active tab. Need "permissions": ["activeTab"] in manifest.json to work
              chrome.tabs.executeScript(tab_id, {file: process.env.PUBLIC_URL + '/contentScript.js'}, function() {
                if (chrome.runtime.lastError) {
                  if (isDevMode()) console.error(chrome.runtime.lastError.message);
                } else {
                  setTimeout(function(){ 
                    // call send_to_content(obj) again after content.js injected
                    tools.sendToContent(tab_id, obj); 
                  }, 200);
                }
              });		
            }

          })
        
      }
      // // if fails to send, inject script and send again
      // if (chrome.runtime.lastError) {
      //   // Above gets "ERROR: Could not establish connection. Receiving end does not exist" if you run it on chrome://extensions/ page or if the extension is just installed and the page has not been refreshed
      // }
      if (isDevMode()) console.log(`recieved response: ${JSON.stringify(response)}`);
  
      // return true;
      });
    // return true;
  }
}

export default tools;