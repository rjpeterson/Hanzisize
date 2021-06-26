/*global browser*/
// above needed for testing

// this background script contains code to listen for the "resize" command hotkey and respond by initializing a resize using the most recent font size and language settings

let injectionError = null;
let contentResponse = {};
let firstResize = true;


const firefox = {// firefox specific url checking
  addonsErrorString: "NOTE: For this addon to work you must leave addons.mozilla.org and go to another website. Mozilla blocks addons from functioning on special Mozilla pages such as this one.",
  aboutErrorString: "NOTE: For this addon to work you must leave this page and go to another website. Mozilla blocks addons from functioning on special Firefox pages such as this one.",

  isFirefox: () => {
    if (typeof browser !== 'undefined') {
      if(typeof browser.runtime.getBrowserInfo === 'function') { // user is on firefox
        return true;
      } else { 
        return false;
      }
    }
  },

  // addons are not allowed on addons.mozilla.org or settings pages. This function checks for these urls
  urlInvalid: (tab) => {
    if ('url' in tab) {
      if (tab.url.match(/\/addons\.mozilla\.org/i)) {
        return firefox.addonsErrorString;
      } else if (tab.url.match(/^about:/i)) {
        return firefox.aboutErrorString;
      } else {
        return false
      }
    } else {
      throw new Error('Active tab has no url value')
    }
  }
}

const edge = {// edge specific url checking
  edgeErrorString: "NOTE: Microsoft blocks extensions and does not allow them to work on special <edge://> pages such as the current page.",
  addonsErrorString: "NOTE: For this extension to work you must leave the Edge Addons store and go to another website. Microsoft blocks extensions from functioning on special pages such as this one.",

  isEdge: () => {
    try { // no regex match means user not on Edge
      return (navigator.userAgent.match(/Edg\//) ? true : false);
    } catch (error) { // returns false if navigator.userAgent is not found
      return null;
    }
  },

  urlInvalid: (tab) => {
    // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
    if ('url' in tab) {
      if(tab.url.match(/^edge/i)) {
        return edge.edgeErrorString;
      } else if (tab.url.match(/microsoftedge\.microsoft\.com\/addons/i)) {
        return edge.addonsErrorString;
      } else {
        return false
      }
    } else {
      throw new Error('Active tab has no url value')
    }
  },
}

const googlechrome = {// chrome specific url checking
  chromeErrorString: "NOTE: Google blocks extensions and does not allow them to work on special <chrome://> pages such as the current page.",
  webstoreErrorString: "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.",

  isChrome: () => {
    try { // no regex match means user not on Chrome
      return (navigator.userAgent.match(/Chrome\//) ? true : false);
    } catch (error) { // returns false if navigator.userAgent is not found, user not using chrome-based browser
      return false;
    }
  },

  urlInvalid: (tab) => {
    // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
    if ('url' in tab) {
      if(tab.url.match(/^chrome/i)) {
        return googlechrome.chromeErrorString;
      } else if (tab.url.match(/chrome\.google.com\/webstore/i)) {
        return googlechrome.webstoreErrorString;
      } else {
        return false;
      }
    } else {
      throw new Error('Active tab has no url value')
    }
  },
}

const opera = {// opera specific url checking
  chromeErrorString: "NOTE: Opera blocks extensions and does not allow them to work on special settings pages such as the current page.",
  addonsErrorString: "NOTE: For this addon to work you must leave addons.opera.com and go to another website. Opera blocks addons from functioning on special pages such as this one.",
  extensionSettings: 'This page cannot be scripted due to an ExtensionsSettings policy.',
  popupWarning: 'You must enable "Allow access to search page results" in Hanzisize extension settings for Hanzisize to work on this page',

  // determines if the user is on Opera or not
  isOpera: () => {
    try { // if no regex match = user not on Chrome
      return (navigator.userAgent.match(/Opera|OPR\//) ? true : false);
    } catch (error) { // returns false if navigator.userAgent is not found
      return false;
    }
  },

  // addons are not allowed on addons.mozilla.org or settings pages. This function checks for these urls
  urlInvalid: (tab) => {
    if ('url' in tab) {
      if (tab.url.match(/\/addons\.opera\.com/i)) {
        return opera.addonsErrorString;
      } else if(tab.url.match(/^chrome/i)) {
        return opera.chromeErrorString;
      } else {
        return false
      }
    } else {
      throw new Error('Active tab has no url value')
    }
  }
}

const getUserBrowser = () => {
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
      result = false;
  }
  return result;
}

// const checkTabValidity = (tabInfo) => {
//   let newErrorMessage;
//   if (!tabInfo.validBrowser || tabInfo.invalidUrl) {
//     newErrorMessage = tabInfo.invalidUrl || 'user browser unknown. unable to check for valid urls';
//     setErrorMessage(newErrorMessage);
//     return false
//   } else {
//     return true
//   }
// }

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
// const resize = async (tabInfo) => {
//     const storedData = getFromStorage();
//     // const tabInfo = await fetchTabInfo();
//     handleInfo(tabInfo, storedData)
// }

// fetch most recent font size and lang settings from chrome storage
const getFromStorage = async () => {
  const result = await new Promise(resolve => {
    chrome.storage.local.get(['minFontSize', 'language'], response => { resolve(response)})});

    if(result.minFontSize && result.language) {
      console.log(`getFromStorage Retrieved object from storage: ${JSON.stringify(await result)}`);
    } 
    // if either of the two values dont exist in storage, set them to default and save them in storage
    if(!result.minFontSize) {
      console.log('getFromStorage result.minFontSize not found');
      result.minFontSize = 0
      // tools.pushFSToStorage(result.minFontSize);
    }
    if(!result.language) {
      console.log('getFromStorage result.language not found');
      result.language = 'chinese'
      // tools.pushLangToStorage(result.language)
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

  console.log(`fetchTabInfo tab ${JSON.stringify(tab)}`)
  // tab object validation
  if(!tab.id) {throw new Error('tab.id not defined')};
  if(!tab.url) {throw new Error('tab.url not defined')}

  return tab;
}

// const handleInfo = (tabInfo, storedData) => {
//   const urlCheck = urlInvalid(tab, userBrowser());
//   if (urlCheck) {return}
//   const contentObj = createContentObj(storedData);

//   console.log(`background script sending content obj: ${JSON.stringify(contentObj)}`)

//   // this needs callback to handle invalid urls and send message back to popup
//   sendToContent(tabInfo.tabId, contentObj)
// }

// prepare info that will be send to the njected content script
const createContentObj = (storedData, mode) => {
  const contentObj = {
    'language': storedData.language,
    'newMinFontSize': storedData.minFontSize,
    'mode': mode,
  };
  console.log(`creating content object: ${JSON.stringify(contentObj)}`)
  return contentObj;
}

// this function gets called on initial load of the extension as well as every time the user selects a new language or changes minFontSize
const sendToContent = (tab_id, obj, _errorCallback) => {
  // attempt to send object to content script
  console.log(`sending message to contentScript with args: ${tab_id}, ${JSON.stringify(obj)}, {frameId: 0}, callback()`)
  chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, (response) => {
    handleFirstMessageResponse(chrome.runtime.lastError, response, tab_id, obj, _errorCallback);
  
    console.log(`sendToContent recieved response: ${JSON.stringify(response)}`);
  });
}

// Handle message response from first attempt at calling the content script
const handleFirstMessageResponse = (lastError, response, tab_id, obj, _errorCallback) => {
  // if tab does not send back a response, the content script hasn't been injected yet
  if (lastError && !response) {

    console.log(`sendToContent initial message send failed. injecting jquery...`);
    // First try to inject jquery into active tab. Requires "permissions": ["activeTab"] in manifest.json
    chrome.tabs.executeScript(tab_id, { file: 'jquery-3.5.1.min.js' }, function () {
      handleJqueryInjection(chrome.runtime.lastError, tab_id, obj, _errorCallback);
    });
  } else {
    contentResponse = response;
    if (_errorCallback) {_errorCallback(injectionError, contentResponse)}
  }
}

// Handle response from jquery injection
const handleJqueryInjection = (lastError, tab_id, obj, _errorCallback) => {
  // if an error is returned, the user is probably trying to use the extension on a page that the browser doesn't allow (e.g. chrome webstore, addons.mozilla.org, etc.) or is using Opera on search results without the proper settings
  if(lastError) {
    handleJqueryInjectErr(chrome.runtime.lastError, _errorCallback);
  } else {
    console.log('jquery injected. injecting content script...')
    // If jquery injects properly, inject contentScript.js in active tab. Requires "permissions": ["activeTab"] in manifest.json
    injectContentScript(tab_id, obj, _errorCallback)
  }
}

const handleJqueryInjectErr = (lastErrorMessage, _errorCallback) => {
  console.log(`jquery injection error: ${JSON.stringify(lastErrorMessage)}`);

  // Opera throws the following error if extension is used on google search results without first given permission
  if (lastErrorMessage.message === opera.extensionSettings) {
    console.log('extension called on google search results with setting disabled')

    injectionError = opera.popupWarning;
  } else {
    injectionError = lastErrorMessage.message;
  }
  if (_errorCallback) {_errorCallback(injectionError, contentResponse)}
}

// Inject contentScript after jquery has been injected
const injectContentScript = (tab_id, obj, _errorCallback) => {
  chrome.tabs.executeScript(tab_id, {file: 'contentScript.js'}, function() {
    // console.log(`executeScript: ${JSON.stringify(chrome.runtime.lastError)}`)
    if (chrome.runtime.lastError) {
      console.log(`content script injection error ${chrome.runtime.lastError.message}`);
      injectionError = chrome.runtime.lastError.message;
      if (_errorCallback) {_errorCallback(injectionError, contentResponse)}
    } else {               
      // if contentScript.js has been successfully injected, call sendMessage a second time to finally send the object to the active tab
      console.log('contentScript injected. setting mode to initial')
      firstResize = true
      obj.mode = 'initial'
      secondMessageToScript(tab_id, obj, _errorCallback) 
    }
  });	
}

// Send final message containing the data retrieved from chrome storage and the tab info after all scripts have been injected
const secondMessageToScript = (tab_id, obj, _errorCallback) => {
  try {
    chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, (response) => {
       console.log(`secondMesageToScript recieved response: ${JSON.stringify(response)}`);
       contentResponse = response;
       if (_errorCallback) {_errorCallback(injectionError, contentResponse)}
    })
   } catch (error) {
      console.log(`scripts injected, but message could not be sent. ${error}`)
  } 
}

const main = async (mode, typeOfCall, sendResponse) => {
  console.log(`activating main function with args: ${mode}, ${typeOfCall}`)
  const tabInfo = await fetchTabInfo();
  let invalidUrl = false;

  const userBrowser = getUserBrowser();
  invalidUrl = urlInvalid(tabInfo, userBrowser);

  // check url validity and display errors if invalid
  if (invalidUrl) {
    if (typeOfCall === 'popup' && sendResponse) {
      sendResponse({invalidUrlMessage: invalidUrl})
    } else {
      return;
    }
  }

  const storedData = await getFromStorage();
  const contentObj = createContentObj(storedData, mode);

  console.log(`background script sending content obj: ${JSON.stringify(contentObj)}`)

  // inject scripts and send data to contentScript to commence resizing
  if (typeOfCall === 'popup' && sendResponse) { // only display errors if using popup
    sendToContent(tabInfo.id, contentObj, ((injectionErr, response) => {
      const responseObject = {
        injectionError: injectionErr,
        tabId: tabInfo.id,
        multipleFrames: response.multipleFrames
      };
      // pass info back to app.js
      sendResponse(responseObject)
    }))
  } else {// no errors displayed for hotkey or storage changes
    sendToContent(tabInfo.id, contentObj);
  }
}

// listen for hotkey
chrome.commands.onCommand.addListener(function(command) {  
  console.log("command:", command)

	if (command === "resize") {
    let mode;
    (firstResize === true) ? mode = 'initial' :  mode = 'resize'; firstResize = false;

    console.log(`Resize command recieved. Calling main function with args mode: ${mode}, typeOfCall: 'hotkey'.`)
    main(mode, 'hotkey');
  }})

// listen for popup message from app.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.message === "popup opened") {
      console.log("received message 'popup opened'")
      let mode;
      (firstResize === true) ? mode = 'initial' :  mode = 'resize'; firstResize = false;
      console.log(`Received message 'popup opened'. Calling main function with args mode: ${mode}, typeOfCall: 'popup', sendResponse: sendResponse`)
      main(mode, 'popup', sendResponse)
    }
  }
)

// listen for changes in chrome.storage
chrome.storage.onChanged.addListener(function (changes, namespace) {
  console.log('listening for changes in chrome.storage')
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    // console.log(
    //   `Storage key "${key}" in namespace "${namespace}" changed.`,
    //   `Old value was "${oldValue}", new value is "${newValue}".`
    // );
    if ("language" in changes) {
      console.log(`language value in chrome storage changed from ${changes.language.oldValue} to ${changes.language.newValue}`)
    
      // activate langage resizing
      console.log(`Calling main function with args mode: 'lang-change', typeOfCall: 'storage-change'`)
      main('lang-change', 'storage-change')
    }
    if ("minFontSize" in changes) {
      console.log(`minFontSize value in chrome storage changed from ${changes.minFontSize.oldValue} to ${changes.minFontSize.newValue}`)

      // activate minfontsize resizing
      console.log(`Calling main function with args mode: 'fontsize-change', typeOfCall: 'storage-change'`)
      main('fontsize-change', 'storage-change')
    }
  }
});

console.log("background page loaded...")