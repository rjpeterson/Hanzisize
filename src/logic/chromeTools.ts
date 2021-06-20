/*global chrome*/
import { FunctionBody } from 'typescript';
import testingTools from '../utils/testingTools';

type StoredData = {
  minFontSize: number,
  language: string
}

type ContentResponse = {
  received: string,
  multipleFrames: boolean
}

type ContentObject = {
  language: string,
  newMinFontSize: number,
  mode: string
}

const tools = {
  injectionError: <string | undefined>'',
  contentResponse: {},

  operaErrors: {
    extensionSettings: 'This page cannot be scripted due to an ExtensionsSettings policy.',
    popupWarning: 'You must enable "Allow access to search page results" in Hanzisize extension settings for Hanzisize to work on this page'
  },

  // push submitted fontsize to chrome local storage
  pushFSToStorage: (minFontSize : number) => {
    chrome.storage.local.set({minFontSize: minFontSize}, () => {
      testingTools.devLog(`tools.pushFSToStorage New minimum font size stored as: ${minFontSize}`)
    })
  },  
  
  // push submitted language to chrome local storage
  pushLangToStorage: (language : string) => {
    chrome.storage.local.set({language: language}, () => {
      testingTools.devLog(`tools.pushFSToStorage New language stored as: ${language}`)
    })
  },

  // return minFontSize and language from chrome local storage if exist, if not, return default values
  getFromStorage: async () => {
    const resultFS: number = await new Promise(resolve => {
      chrome.storage.local.get(['minFontSize'], response => { resolve(response.minFontSize)})});
    const resultLang: string = await new Promise(resolve => {
      chrome.storage.local.get([ 'language'], response => { resolve(response.language)})});
      const result: StoredData = {minFontSize: resultFS, language: resultLang};

    if(result.minFontSize && result.language) {
      testingTools.devLog(`tools.getFromStorage Retrieved object from storage: ${JSON.stringify(result)}`);
    } 
    if(!result.minFontSize) {
      testingTools.devLog('tools.getFromStorage result.minFontSize not found');
      result.minFontSize = 0
    }
    if(!result.language) {
      testingTools.devLog('tools.getFromStorage result.language not found');
      result.language = 'chinese'
    }
    return result;
  },

  // Handle initial message response
  handleFirstMessageResponse: (lastError : chrome.runtime.LastError | undefined, response : ContentResponse, tabId: number, obj : ContentObject, _errorCallback?: Function) => {
    // if tab does not send back a response, the content script hasn't been injected yet
    if (lastError && !response) {

      testingTools.devLog(`tools.sendToContent initial message send failed. injecting jquery...`);
      // First try to inject jquery into active tab. Requires "permissions": ["activeTab"] in manifest.json
      chrome.tabs.executeScript(tabId, { file: process.env.PUBLIC_URL + 'jquery-3.5.1.min.js' }, function () {
        tools.handleJqueryInjection(lastError, tabId, obj, _errorCallback);
      });
    } else {
      tools.contentResponse = response;
      if (_errorCallback) {_errorCallback(tools.injectionError, tools.contentResponse)}
    }
  },

  // Handle response from jquery injection
  handleJqueryInjection: (lastError: chrome.runtime.LastError, tabId: number, obj: ContentObject, _errorCallback?: Function) => {
    // if an error is returned, the user is probably trying to use the extension on a page that the browser doesn't allow (e.g. chrome webstore, addons.mozilla.org, etc.) or is using Opera on search results without the proper settings
    if(lastError) {
      tools.handleJqueryInjectErr(lastError, _errorCallback);
    } else {
      testingTools.devLog('jquery injected. injecting content script...')
      // If jquery injects properly, inject contentScript.js in active tab. Requires "permissions": ["activeTab"] in manifest.json
      tools.injectContentScript(tabId, obj, _errorCallback)
    }
  },

  // Handle Opera search results permission & other injection errors
  handleJqueryInjectErr: (lastError: chrome.runtime.LastError, _errorCallback?: Function) => {
    testingTools.devLog(`jquery injection error: ${JSON.stringify(lastError)}`);
  
    // Opera throws the following error if extension is used on google search results without first given permission
    if (lastError.message === tools.operaErrors.extensionSettings) {
      testingTools.devLog('extension called on google search results with setting disabled')

      tools.injectionError = tools.operaErrors.popupWarning;
    } else {
      tools.injectionError = lastError.message;
    }
    if (_errorCallback) {_errorCallback(tools.injectionError, tools.contentResponse)}
  },

  // Inject contentScript after jquery has been injected
  injectContentScript: (tabId: number, obj: ContentObject, _errorCallback?: Function) => {
    chrome.tabs.executeScript(tabId, {file: process.env.PUBLIC_URL + '/contentScript.js'}, function() {
      console.log(`executeScript: ${JSON.stringify(chrome.runtime.lastError)}`)
      if (chrome.runtime.lastError) {
        testingTools.devLog(`content script injection error ${chrome.runtime.lastError.message}`);
        tools.injectionError = chrome.runtime.lastError.message;
        if (_errorCallback) {_errorCallback(tools.injectionError, tools.contentResponse)}
      } else {               
        // if contentScript.js has been successfully injected, call sendMessage a second time to finally send the object to the active tab
        tools.secondMessageToScripts(tabId, obj, _errorCallback) 
      }
    });	
  },

  // Send message after scripts have been injected
  secondMessageToScripts: (tabId: number, obj: ContentObject, _errorCallback?: Function) => {
    try {
      chrome.tabs.sendMessage(tabId, obj, {frameId: 0}, function(response) {
         testingTools.devLog(`tools.sendToContent (2nd try) recieved response: ${JSON.stringify(response)}`);
         tools.contentResponse = response;
         if (_errorCallback) {_errorCallback(tools.injectionError, tools.contentResponse)}
      })
     } catch (error) {
        testingTools.devLog(`scripts injected, but message could not be sent. ${error}`)
    } 
  },

  // this function gets called on initial load of the extension as well as every time the user selects a new language or changes minFontSize
  sendToContent: (tabId : number, obj : ContentObject, _errorCallback?: Function) => {
    // attempt to send object to content script
    chrome.tabs.sendMessage(tabId, obj, {frameId: 0}, function(response) {
      tools.handleFirstMessageResponse(chrome.runtime.lastError, response, tabId, obj, _errorCallback);
    
      testingTools.devLog(`tools.sendToContent recieved response: ${JSON.stringify(response)}`);
    });
  }
}

export default tools;