/*global chrome*/

// update_url is set by chrome webstore on submit. If it doesn't exist, the extension was loaded locally rather than installed from webstore
function isDevMode() {
  if(process.env.NODE_ENV === "test") {return true}
  else {return !('update_url' in chrome.runtime.getManifest());}  
}

const tools = {
  operaErrors: {
    extensionSettings: 'This page cannot be scripted due to an ExtensionsSettings policy.',
    popupWarning: 'You must enable "Allow access to search page results" in Hanzisize extension settings for Hanzisize to work on this page'
  },

  // push submitted fontsize to chrome local storage
  pushFSToStorage: (minFontSize) => {
    chrome.storage.local.set({minFontSize: minFontSize}, () => {
      if (isDevMode()) console.log(`tools.pushFSToStorage New minimum font size stored as: ${minFontSize}`)
    })
  },  
  
  // push submitted language to chrome local storage
  pushLangToStorage: (language) => {
    chrome.storage.local.set({language: language}, () => {
      if (isDevMode()) console.log(`tools.pushFSToStorage New language stored as: ${language}`)
    })
  },

  // return minFontSize and language from chrome local storage if exist
  getFromStorage: (_callback) => {
    chrome.storage.local.get(['minFontSize', 'language'], (result) => {
      if(result.minFontSize && result.language) {
        if (isDevMode()) {
          console.log(`tools.getFromStorage Retrieved object from storage: ${JSON.stringify(result)}`)
        };
      } else if(!result.minFontSize) {
        if (isDevMode()) console.log('tools.getFromStorage result.minFontSize not found');
      } else {
        if (isDevMode()) console.log('tools.getFromStorage result.language not found');
      }
      _callback(result);
    })
  },

  // this function gets called on initial load of the extension as well as every time the user selects a new language or changes minFontSize
  sendToContent:  (tab_id, obj, _callback) => {
    let injectionError = null;

    // attempt to send object to content script
    chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {

      // if tab does not send back a response, the content script hasn't been injected yet
      if(chrome.runtime.lastError && !response) {

        // First try to inject jquery into active tab. Requires "permissions": ["activeTab"] in manifest.json
        chrome.tabs.executeScript(tab_id, {file: process.env.PUBLIC_URL + 'jquery-3.5.1.slim.min.js'}, function() {

          // if an error is returned, the user is probably trying to use the extension on a page that the browser doesn't allow (e.g. chrome webstore, addons.mozilla.org, etc.)
          if(chrome.runtime.lastError) {
            if (isDevMode()) console.error(`jquery injection error: ${chrome.runtime.lastError.message}`);

            // Opera throws the following error if extension is used on google search results without first given permission
            if (chrome.runtime.lastError.message === tools.operaErrors.extensionSettings) {
              console.log('extension called on google search results with setting disabled')
              injectionError = tools.operaErrors.popupWarning;

              // callback for initial injection of scripts, error produced
              if (_callback) {
                _callback(injectionError);
              }
            }
          } else {

            // If jquery injects properly, inject contentScript.js in active tab. Requires "permissions": ["activeTab"] in manifest.json
            chrome.tabs.executeScript(tab_id, {file: process.env.PUBLIC_URL + '/contentScript.js'}, function() {
              console.log(`executeScript: ${chrome.runtime.lastError}`)
              if (chrome.runtime.lastError) {
                if (isDevMode()) console.error(`content script injection error ${chrome.runtime.lastError.message}`);
              } else {
                // if contentScript.js has been successfully injected, call sendToContent a second time to finally send the object to the active tab with the initial call to sendMessage
                // setTimeout(function(){ 
                  // tools.sendToContent(tab_id, obj); 
                  chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {
                    if (isDevMode()) console.log(`tools.sendToContent (2nd try) recieved response: ${JSON.stringify(response)}`);
                  })
                // }, 200);
              }
            });		

            // callback for initial injection of scripts, no errors
            if (_callback) {
              _callback(injectionError);
            }
          }
        })
      } else {  // callback for scripts already succesfully injected, popup reopened
        if (_callback) {
          _callback(injectionError)
        }
      }
    
      if (isDevMode()) console.log(`tools.sendToContent recieved response: ${JSON.stringify(response)}`);
    });
  }
}

export default tools;