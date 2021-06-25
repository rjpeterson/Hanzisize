// this background script contains code to listen for the "resize" command hotkey and respond by initializing a resize using the most recent font size and language settings
let injectionError = null;
let contentResponse = {};

const operaErrors = {
  extensionSettings: 'This page cannot be scripted due to an ExtensionsSettings policy.',
  popupWarning: 'You must enable "Allow access to search page results" in Hanzisize extension settings for Hanzisize to work on this page'
}

const userBrowser = () => {
  if (firefox.isFirefox() === true) {// user is on firefox
    return 'firefox';
  } else if (opera.isOpera() === true) { // user is on opera
    return 'opera';
  } else if (edge.isEdge() === true) { // user is on edge
    return 'edge';
  } else if (googlechrome.isChrome() === true) { // test googlechrome last because the above browsers' useragent strings also contain the string "Chrome"
    return 'chrome';
  } else {
    return 'unknown';
  }
}

// check for disallowed urls by browser
const urlInvalid = (tab, browser) => {
  let result;
  switch(browser) {
    case 'firefox':
      result = firefox.urlInvalid(tab)
      break;
    case 'opera':
      result = opera.urlInvalid(tab)
      break;
    case 'edge':
      result = edge.urlInvalid(tab)
      break;
    case 'chrome':
      result = googlechrome.urlInvalid(tab);
      break;
    default:
      result = true;
  }
  return result;
}

const checkTabValidity = (tabInfo) => {
  let newErrorMessage;
  if (!tabInfo.validBrowser || tabInfo.invalidUrl) {
    newErrorMessage = tabInfo.invalidUrl || 'user browser unknown. unable to check for valid urls';
    setErrorMessage(newErrorMessage);
    return false
  } else {
    return true
  }
}

// const handleInfo = (tabInfo, storedData) => {
//   const contentObj = createContentObj(storedData);
//   const validTab = checkTabValidity(tabInfo);

//   if(!validTab) {return}

//   console.log(`useEffect sending content obj: ${JSON.stringify(contentObj)}`)

//   tools.sendToContent(tabInfo.tabId, contentObj, (injectionErr, response) => {
//       setErrorMessage(injectionErr);
//       setTabId(tabInfo.tabId);
//       setiFrames(response.multipleFrames);
//   })
// }

// primary function to fetch all necessary data, inject scripts, and initiate resize
const resize = async (storedData) => {
    const tabInfo = await fetchTabInfo();
    handleInfo(tabInfo, storedData)
}

// fetch most recent font size and lang settings from chrome storage
const getFromStorage = async () => {
  const result = await new Promise(resolve => {
    chrome.storage.local.get(['minFontSize', 'language'], response => { resolve(response)})});

    if(result.minFontSize && result.language) {
      console.log(`tools.getFromStorage Retrieved object from storage: ${JSON.stringify(await result)}`);
    } 
    // if either of the two values dont exist in storage, set them to default and save them in storage
    if(!result.minFontSize) {
      console.log('tools.getFromStorage result.minFontSize not found');
      result.minFontSize = 0
      tools.pushFSToStorage(result.minFontSize);
    }
    if(!result.language) {
      console.log('tools.getFromStorage result.language not found');
      result.language = 'chinese'
      tools.pushLangToStorage(result.language)
    }
    return await result;
}

// get active tab info so we know where to inject the content script
const fetchTabInfo = async () => {
  // get active tab info
  const getQueryResult = () => {
    return new Promise(resolve => {
      chrome.tabs.query({active: true, currentWindow: true}, response => resolve(response))
    }) 
  }

  const tabs = await getQueryResult()
  const tab = await tabs[0];

  console.log(`onAppMount.main tab ${JSON.stringify(tab)}`)
  // tab object validation
  if(!tab.id) {throw new Error('tab.id not defined')};
  if(!tab.url) {throw new Error('tab.url not defined')}

  const result = {tabId: tab.id};
  console.log(`app.useEffect fetched tab info: ${JSON.stringify(result)}`);
  return result;
}

const handleInfo = (tabInfo, storedData) => {
  const contentObj = createContentObj(storedData);

  console.log(`background script sending content obj: ${JSON.stringify(contentObj)}`)

  sendToContent(tabInfo.tabId, contentObj)
}

// prepare info that will be send to the njected content script
const createContentObj = (storedData) => {
  const contentObj = {
    'language': storedData.language,
    'newMinFontSize': storedData.minFontSize,
    'mode': 'initial',
  };
  console.log(`creating content object: ${JSON.stringify(contentObj)}`)
  return contentObj;
}

// this function gets called on initial load of the extension as well as every time the user selects a new language or changes minFontSize
const sendToContent = (tab_id, obj, _errorCallback) => {
  // attempt to send object to content script
  chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {
    handleFirstMessageResponse(chrome.runtime.lastError, response, tab_id, obj, _errorCallback);
  
    console.log(`sendToContent recieved response: ${JSON.stringify(response)}`);
  });
}

// Handle message response from first attempt at calling the content script
const handleFirstMessageResponse = (lastError, response, tabId, obj, _errorCallback) => {
  // if tab does not send back a response, the content script hasn't been injected yet
  if (lastError && !response) {

    console.log(`sendToContent initial message send failed. injecting jquery...`);
    // First try to inject jquery into active tab. Requires "permissions": ["activeTab"] in manifest.json
    chrome.tabs.executeScript(tabId, { file: 'jquery-3.5.1.min.js' }, function () {
      handleJqueryInjection(chrome.runtime.lastError, tabId, obj, _errorCallback);
    });
  } else {
    contentResponse = response;
    if (_errorCallback) {_errorCallback(injectionError, contentResponse)}
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

const handleJqueryInjectErr = (lastErrorMessage, _errorCallback) => {
  console.log(`jquery injection error: ${JSON.stringify(lastErrorMessage)}`);

  // Opera throws the following error if extension is used on google search results without first given permission
  if (lastErrorMessage.message === operaErrors.extensionSettings) {
    console.log('extension called on google search results with setting disabled')

    injectionError = operaErrors.popupWarning;
  } else {
    injectionError = lastErrorMessage.message;
  }
  if (_errorCallback) {_errorCallback(injectionError, contentResponse)}
}

// Inject contentScript after jquery has been injected
const injectContentScript = (tabId, obj, _errorCallback) => {
  chrome.tabs.executeScript(tabId, {file: process.env.PUBLIC_URL + '/contentScript.js'}, function() {
    console.log(`executeScript: ${JSON.stringify(chrome.runtime.lastError)}`)
    if (chrome.runtime.lastError) {
      console.log(`content script injection error ${chrome.runtime.lastError.message}`);
      injectionError = chrome.runtime.lastError.message;
      if (_errorCallback) {_errorCallback(injectionError, contentResponse)}
    } else {               
      // if contentScript.js has been successfully injected, call sendMessage a second time to finally send the object to the active tab
      secondMessageToScripts(tabId, obj, _errorCallback) 
    }
  });	
}

// Send final message containing the data retrieved from chrome storage and the tab info after all scripts have been injected
const secondMessageToScripts = (tabId, obj, _errorCallback) => {
  try {
    chrome.tabs.sendMessage(tabId, obj, {frameId: 0}, function(response) {
       console.log(`tools.sendToContent (2nd try) recieved response: ${JSON.stringify(response)}`);
       contentResponse = response;
       if (_errorCallback) {_errorCallback(injectionError, contentResponse)}
    })
   } catch (error) {
      console.log(`scripts injected, but message could not be sent. ${error}`)
  } 
}


chrome.commands.onCommand.addListener(function(command) {  
  console.log("command:", command)

	if (command === "resize") {
    // const storedData = getFromStorage();
    console.log("Resize command recieved. Calling resize function.")
    // resize(storedData);
  }})

console.log("background page loaded...")

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "popup opened") {
      console.log("received message 'popup opened'")
      // check browser
      // check url
      // check browser
    // const validBrowser = userBrowser();
    // const invalidUrl = urlInvalid(tab, validBrowser);
    // return {
    //   tabId: tab.id, 
    //   validBrowser: validBrowser,
    //   invalidUrl: invalidUrl
    // };
      // return error if invalid url
      // activate resizing sendtocontent
    }
  }
)

chrome.storage.onChanged.addListener(function (changes, namespace) {
  console.log('listening for changes in chrome.storage')
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    // console.log(
    //   `Storage key "${key}" in namespace "${namespace}" changed.`,
    //   `Old value was "${oldValue}", new value is "${newValue}".`
    // );
    if ("language" in changes) {
      console.log(`language value in chrome storage changed from ${changes.language.oldValue} to ${changes.language.newValue}`)
      // activate langage resizing for changes.language.newValue
    }
    if ("minFontSize" in changes) {
      console.log(`language value in chrome storage changed from ${changes.minFontSize.oldValue} to ${changes.minFontSize.newValue}`)
      // activate minfontsize resizing for changes.minFontSize.newValue
    }
  }
});