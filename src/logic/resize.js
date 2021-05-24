const fetchStoredData = async () => {
  const result = await new Promise(resolve => {
    chrome.storage.local.get(['minFontSize', 'language'], response => { resolve(response)})});

    if(result.minFontSize && result.language) {
      console.log(`tools.getFromStorage Retrieved object from storage: ${JSON.stringify(await result)}`);
    } 
    if(!result.minFontSize) {
      console.log('tools.getFromStorage result.minFontSize not found');
      result.minFontSize = 0
    }
    if(!result.language) {
      console.log('tools.getFromStorage result.language not found');
      result.language = 'chinese'
    }
    return await result;
}

const fetchTabInfo = async () => {
  const getQueryResult = () => {
    return new Promise(resolve => {
      chrome.tabs.query({active: true, currentWindow: true}, response => resolve(response))
    }) 
  };
  const tabs = await getQueryResult()
  const tab = await tabs[0];

  const result = {
    tabId: tab.id, 
    validBrowser: "chrome",
    invalidUrl: false
  };
  console.log(`app.useEffect fetched tab info: ${JSON.stringify(result)}`);
  return result;
}

const checkTabValidity = (tabInfo) => {
  let newErrorMessage;
  if (!tabInfo.validBrowser || tabInfo.invalidUrl) {
    newErrorMessage = tabInfo.invalidUrl || 'user browser unknown. unable to check for valid urls';
    return false
  } else {
    return true
  }
}

const createContentObj = (storedData) => {
  const contentObj = {
    'language': storedData.language,
    'newMinFontSize': storedData.minFontSize,
    'mode': 'initial',
  };
  console.log(`creating content object: ${JSON.stringify(contentObj)}`)
  return contentObj;
}

// Handle initial message response
const handleFirstMessageResponse = (lastError, response, tabId, obj, _errorCallback) => {
  // if tab does not send back a response, the content script hasn't been injected yet
  if (lastError && !response) {

    console.log(`tools.sendToContent initial message send failed. injecting jquery...`);
    // First try to inject jquery into active tab. Requires "permissions": ["activeTab"] in manifest.json
    chrome.tabs.executeScript(tabId, { file: process.env.PUBLIC_URL + 'jquery-3.5.1.min.js' }, function () {
      handleJqueryInjection(chrome.runtime.lastError, tabId, obj, _errorCallback);
    });
  // } else {
  //   tools.contentResponse = response;
  //   if (_errorCallback) {_errorCallback(tools.injectionError, tools.contentResponse)}
  }
}

// Handle response from jquery injection
const handleJqueryInjection = (lastError, tabId, obj, _errorCallback) => {
  // if an error is returned, the user is probably trying to use the extension on a page that the browser doesn't allow (e.g. chrome webstore, addons.mozilla.org, etc.) or is using Opera on search results without the proper settings
  if(lastError) {
    handleJqueryInjectErr(chrome.runtime.lastError, _errorCallback);
  } else {
    console.log('jquery injected. injecting content script...')
    // If jquery injects properly, inject contentScript.js in active tab. Requires "permissions": ["activeTab"] in manifest.json
    injectContentScript(tabId, obj, _errorCallback)
  }
}

// Handle Opera search results permission & other injection errors
const handleJqueryInjectErr = (lastErrorMessage, _errorCallback) => {
  console.log(`jquery injection error: ${JSON.stringify(lastErrorMessage)}`);

  // Opera throws the following error if extension is used on google search results without first given permission
  // if (lastErrorMessage.message === tools.operaErrors.extensionSettings) {
  //   console.log('extension called on google search results with setting disabled')

  //   tools.injectionError = tools.operaErrors.popupWarning;
  // } else {
  //   tools.injectionError = lastErrorMessage.message;
  // }
  // if (_errorCallback) {_errorCallback(tools.injectionError, tools.contentResponse)}
}

// Inject contentScript after jquery has been injected
const injectContentScript = (tabId, obj, _errorCallback) => {
  chrome.tabs.executeScript(tabId, {file: process.env.PUBLIC_URL + '/contentScript.js'}, function() {
    console.log(`executeScript: ${JSON.stringify(chrome.runtime.lastError)}`)
    if (chrome.runtime.lastError) {
      console.log(`content script injection error ${chrome.runtime.lastError.message}`);
      const injectionError = chrome.runtime.lastError.message;
      // if (_errorCallback) {_errorCallback(injectionError, tools.contentResponse)}
    } else {               
      // if contentScript.js has been successfully injected, call sendMessage a second time to finally send the object to the active tab
      secondMessageToScripts(tabId, obj, _errorCallback) 
    }
  });	
}

// Send message after scripts have been injected
const secondMessageToScripts = (tabId, obj, _errorCallback) => {
  try {
    chrome.tabs.sendMessage(tabId, obj, {frameId: 0}, function(response) {
       console.log(`tools.sendToContent (2nd try) recieved response: ${JSON.stringify(response)}`);
       const contentResponse = response;
      //  if (_errorCallback) {_errorCallback(tools.injectionError, tools.contentResponse)}
    })
   } catch (error) {
      console.log(`scripts injected, but message could not be sent. ${error}`)
  } 
}

// this function gets called on initial load of the extension as well as every time the user selects a new language or changes minFontSize
const sendToContent = (tab_id, obj, _errorCallback) => {
  // attempt to send object to content script
  chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {
    handleFirstMessageResponse(chrome.runtime.lastError, response, tab_id, obj, _errorCallback);
  
    console.log(`tools.sendToContent recieved response: ${JSON.stringify(response)}`);
  });
}

const handleInfo = (tabInfo, storedData) => {
  const contentObj = createContentObj(storedData);
  const validTab = checkTabValidity(tabInfo);

  if(!validTab) {return}

  console.log(`useEffect sending content obj: ${JSON.stringify(contentObj)}`)

  sendToContent(tabInfo.tabId, contentObj, () => {})
}

const resize = async () => {
  const storedData = await fetchStoredData();
  const tabInfo = await fetchTabInfo();

  handleInfo(tabInfo, storedData);
}

export default resize;