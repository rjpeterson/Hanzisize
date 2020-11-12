/*global chrome*/
import isDevMode from './isDevMode';

const tools = {
  injectionError: null,
  contentResponse: {},

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

  // Handle initial message response
  handleFirstMessageResponse: (lastError, response, tabId, obj) => {
    // if tab does not send back a response, the content script hasn't been injected yet
    if (lastError && !response) {

      if (isDevMode())
        console.log(`tools.sendToContent initial message send failed. injecting jquery...`);
      // First try to inject jquery into active tab. Requires "permissions": ["activeTab"] in manifest.json
      chrome.tabs.executeScript(tabId, { file: process.env.PUBLIC_URL + 'jquery-3.5.1.slim.min.js' }, function () {
        tools.handleJqueryInjection(chrome.runtime.lastError, tabId, obj);
      });
    } else {
      tools.contentResponse = response;
    }
  },

  // Handle response from jquery injection
  handleJqueryInjection: (lastError, tabId, obj) => {
    // if an error is returned, the user is probably trying to use the extension on a page that the browser doesn't allow (e.g. chrome webstore, addons.mozilla.org, etc.) or is using Opera on search results without the proper settings
    if(lastError) {
      tools.injectionError = tools.handleJqueryInjectErr(chrome.runtime.lastError);
    } else {
      if (isDevMode()) {
        console.log('jquery injected. injecting content script...')
      }
      // If jquery injects properly, inject contentScript.js in active tab. Requires "permissions": ["activeTab"] in manifest.json
      tools.injectCS(tabId, obj)
    }
  },

  // Handle Opera search results permission & other injection errors
  handleJqueryInjectErr: (lastErrorMessage) => {
    if (isDevMode()) {
      console.error(`jquery injection error: ${lastErrorMessage}`);
    }
  
    // Opera throws the following error if extension is used on google search results without first given permission
    if (lastErrorMessage === tools.operaErrors.extensionSettings) {
      if (isDevMode()) {console.log('extension called on google search results with setting disabled')}

      tools.injectionError = tools.operaErrors.popupWarning;
    } else {
      tools.injectionError = lastErrorMessage;
    }
  },

  // Inject contentScript after jquery has been injected
  injectCS: (tabId, obj) => {
    chrome.tabs.executeScript(tabId, {file: process.env.PUBLIC_URL + '/contentScript.js'}, function() {
      console.log(`executeScript: ${chrome.runtime.lastError}`)
      if (chrome.runtime.lastError) {
        if (isDevMode()) console.error(`content script injection error ${chrome.runtime.lastError.message}`);
        tools.injectionError = chrome.runtime.lastError.message;
      } else {               
        // if contentScript.js has been successfully injected, call sendMessage a second time to finally send the object to the active tab
        tools.secondMessageToScripts(tabId, obj) 
      }
    });	
  },

  // Send message after scripts have been injected
  secondMessageToScripts: (tabid, obj) => {
    try {
      chrome.tabs.sendMessage(tabid, obj, {frameId: 0}, function(response) {
         if (isDevMode()) console.log(`tools.sendToContent (2nd try) recieved response: ${JSON.stringify(response)}`);
         tools.contentResponse = response;
      })
     } catch (error) {
        if (isDevMode()) console.log(`scripts injected, but message could not be sent. ${error}`)
    } 
  },

  // this function gets called on initial load of the extension as well as every time the user selects a new language or changes minFontSize
  sendToContent: (tab_id, obj, _callback) => {
    // attempt to send object to content script
    chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {
      tools.handleFirstMessageResponse(chrome.runtime.lastError, response, tab_id, obj);
    
      if (_callback) {_callback(tools.injectionError, tools.contentResponse)}
      if (isDevMode()) console.log(`tools.sendToContent recieved response: ${JSON.stringify(response)}`);
    });
  }
}

export default tools;