/*global chrome*/

const tools = {
  // push submitted fontsize to chrome local storage
  pushToStorage: async (minFontSize) => {
    await chrome.storage.local.set({minFontSize: minFontSize}, () => {
      if (process.env.NODE_ENV ==='production') console.log(`New minimum font size stored as: ${minFontSize}`)
    })
  },

  // return minFontSize from chrome local storage if exists
  getFromStorage: async () => {
    const returnVal = await chrome.storage.local.get('minFontSize', (result) => {
      if(result.minFontSize) {
        if (process.env.NODE_ENV ==='production') {
          console.log(`chromeTools 16 Retrieved min font size from storage: ${result.minFontSize}`)
        };
        return result.minFontSize;
      } else {
        if (process.env.NODE_ENV === 'production') {
          console.log('result.minFontSize not found')
        }
        return undefined;
      }
    })
    return returnVal;
  },

  sendToContent: (tab_id, obj) => {
    if (process.env.NODE_ENV ==='production') console.log(`chromeTools.sendToContent 30 tab_id: ${tab_id}, obj: ${JSON.stringify(obj)}`);
  
    // try to send object to content script
    chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {
      // if fails to send, inject script and send again
      if (chrome.runtime.lastError) {
        if (process.env.NODE_ENV ==='production') console.log('ERROR: ' + chrome.runtime.lastError.message);
        // Above gets "ERROR: Could not establish connection. Receiving end does not exist" if you run it on chrome://extensions/ page or if the extension is just installed and the page has not been refreshed
      
        // Inject content.js in active tab. Need "permissions": ["activeTab"] in manifest.json to work
        chrome.tabs.executeScript(tab_id, {file: process.env.PUBLIC_URL + '/contentScript.js'}, function() {
          if (chrome.runtime.lastError) {
            if (process.env.NODE_ENV ==='production') console.error(chrome.runtime.lastError.message);
          } else {
            setTimeout(function(){ 
              // call send_to_content(obj) again after content.js injected
              tools.sendToContent(tab_id, obj); 
            }, 200);
          }
        });		
      }
      if (process.env.NODE_ENV ==='production') console.log(JSON.stringify(response));
  
      return true;
      });
    return true;
  }
}

export default tools;