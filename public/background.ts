// this background script contains code to listen for the "resize" command hotkey and respond by initializing a resize using the most recent font size and language settings

import { StoredData, ContentObject, ContentResponse, GetQueryResult } from '../types';

interface TabInfo { 
  tabId: number
}
 
const hotkeyResize = {
  // primary function to fetch all necessary data, inject scripts, and initiate resize
  resize: async () => {
    // check if there is anything in chrome storage
    const storedData = await hotkeyResize.fetchStoredData();
    
    // if so, continue
    if(storedData) {
      const tabInfo = await hotkeyResize.fetchTabInfo();
      hotkeyResize.handleInfo(tabInfo, storedData)
    };
  },

  // fetch most recent font size and lang settings from chrome storage
  fetchStoredData: async () => {
    let result: StoredData;
    const resultMFS = await new Promise<any>(resolve => {
      chrome.storage.local.get(['minFontSize'], (response) => { resolve(response)})});
    const resultLang = await new Promise<any>(resolve => {
      chrome.storage.local.get(['language'], response => { resolve(response)})});
    result = {
      minFontSize: resultMFS.minFontSize, 
      language: resultLang.language
    };
      // set default language to chinese if there is no language in storage
    result.language = (result.language || "chinese")
    // if there is nothing in chrome storage, abort resizing
    return (!result.minFontSize ? false : result)
  },

  // get active tab info so we know where to inject the content script
  fetchTabInfo: async () => {
    const getQueryResult: GetQueryResult = () => {
      return new Promise(resolve => {
        chrome.tabs.query({active: true, currentWindow: true}, response => resolve(response))
      }) 
    };
    // get current open tab from tab query result
    const tabs : chrome.tabs.Tab[] = await getQueryResult()
    const tab : chrome.tabs.Tab = tabs[0];
    if(tab.id) {
      const result: TabInfo = {tabId: tab.id};
      console.log(`app.useEffect fetched tab info: ${JSON.stringify(result)}`);
      return result;
    } else {
      throw new Error('tab info not found')
    }
  },

  handleInfo: (tabInfo: TabInfo, storedData: StoredData) => {
    const contentObj = hotkeyResize.createContentObj(storedData);
  
    console.log(`background script sending content obj: ${JSON.stringify(contentObj)}`)
  
    hotkeyResize.sendToContent(tabInfo.tabId, contentObj)
  },

  // prepare info that will be send to the njected content script
  createContentObj: (storedData: StoredData) => {
    const contentObj = {
      'language': storedData.language,
      'minFontSize': storedData.minFontSize,
      'mode': 'initial',
    };
    console.log(`creating content object: ${JSON.stringify(contentObj)}`)
    return contentObj;
  },

  // this function gets called on initial load of the extension as well as every time the user selects a new language or changes minFontSize
  sendToContent: (tab_id: number, obj: ContentObject) => {
    // attempt to send object to content script
    chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {
      hotkeyResize.handleFirstMessageResponse(chrome.runtime.lastError, response, tab_id, obj);
    
      console.log(`tools.sendToContent recieved response: ${JSON.stringify(response)}`);
    });
  },

  // Handle message response from first attempt at calling the content script
  handleFirstMessageResponse: (lastError: chrome.runtime.LastError | undefined, response: ContentResponse, tabId: number, obj: ContentObject) => {
    // if tab does not send back a response, the content script hasn't been injected yet
    if (lastError && !response) {

      console.log(`tools.sendToContent initial message send failed. injecting jquery...`);
      // First try to inject jquery into active tab. Requires "permissions": ["activeTab"] in manifest.json
      chrome.tabs.executeScript(tabId, { file: 'jquery-3.5.1.min.js' }, function () {
        hotkeyResize.handleJqueryInjection(chrome.runtime.lastError, tabId, obj);
      });
    }
  },

  // Handle response from jquery injection
  handleJqueryInjection: (lastError: chrome.runtime.LastError | undefined, tabId: number, obj: ContentObject) => {
    // if an error is returned, the user is probably trying to use the extension on a page that the browser doesn't allow (e.g. chrome webstore, addons.mozilla.org, etc.) or is using Opera on search results without the proper settings. When using hotkeys, we don't give any notification, since they will see the relevant error when opening the popup
    if(lastError) {
      return
    } else {
      console.log('jquery injected. injecting content script...')
      // If jquery injects properly, inject contentScript.js in active tab. Requires "permissions": ["activeTab"] in manifest.json
      hotkeyResize.injectContentScript(tabId, obj)
    }
  },

  // Inject contentScript after jquery has been injected
  injectContentScript: (tabId: number, obj: ContentObject) => {
    chrome.tabs.executeScript(tabId, {file: '/contentScript.js'}, function() {
      if (chrome.runtime.lastError) {
        console.log(`content script injection error ${chrome.runtime.lastError.message}`);
        return
      } else {               
        // if contentScript.js has been successfully injected, call sendMessage a second time to finally send the object to the active tab
        hotkeyResize.secondMessageToScripts(tabId, obj) 
      }
    });	
  },

  // Send final message containing the data retrieved from chrome storage and the tab info after all scripts have been injected
  secondMessageToScripts: (tabId: number, obj: ContentObject) => {
    try {
      chrome.tabs.sendMessage(tabId, obj, {frameId: 0}, function(response) {
        console.log(`tools.sendToContent (2nd try) recieved response: ${JSON.stringify(response)}`);
      })
    } catch (error) {
        console.log(`scripts injected, but message could not be sent. ${error}`)
    } 
  }
}

chrome.commands.onCommand.addListener(function(command) {  
  console.log("command:", command)

	if (command == "resize") {
    console.log("Resize command recieved. Calling resize function.")
    hotkeyResize.resize();
  }})

console.log("background page loaded...")