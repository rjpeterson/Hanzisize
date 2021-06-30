// provide chrome api listener methods so jest doesnt throw errors
if (typeof chrome == "undefined") {
  global.chrome = {
    commands: {
      // @ts-ignore
      onCommand: {
        addListener: () => {},
      },
    },
    runtime: {
      // @ts-ignore
      onMessage: {
        addListener: () => {},
      },
    },
    storage: {
      // @ts-ignore
      onChanged: {
        addListener: () => {},
      },
    },
  };
}

// this background script contains code to listen for the "resize" command hotkey and respond by initializing a resize using the most recent font size and language settings
import {
  StoredData,
  ContentObject,
  ContentResponse,
  ErrorCallbackFunc,
  LanguageObject,
  FontSizeObject,
  ValidityCheck,
} from "../types";

const browserCheck = {
  firefox: {
    // firefox specific url checking
    addonsErrorString:
      "NOTE: For this addon to work you must leave addons.mozilla.org and go to another website. Mozilla blocks addons from functioning on special Mozilla pages such as this one.",
    aboutErrorString:
      "NOTE: For this addon to work you must leave this page and go to another website. Mozilla blocks addons from functioning on special Firefox pages such as this one.",

    isFirefox: () => {
      // @ts-ignore
      if (typeof browser !== "undefined") {
        // @ts-ignore
        if (typeof browser.runtime.getBrowserInfo === "function") {
          // user is on firefox
          return true;
        } else {
          return false;
        }
      }
    },

    // addons are not allowed on addons.mozilla.org or settings pages. This function checks for these urls
    urlValid: (tab: chrome.tabs.Tab) => {
      let result = {
        message: "",
        valid: false,
      };
      if ("url" in tab) {
        if (tab.url?.match(/\/addons\.mozilla\.org/i)) {
          result.message = browserCheck.firefox.addonsErrorString;
        } else if (tab.url?.match(/^about:/i)) {
          result.message = browserCheck.firefox.aboutErrorString;
        } else {
          result.valid = true;
        }
      } else {
        throw new Error("Active tab has no url value");
      }
      return result;
    },
  },

  edge: {
    // edge specific url checking
    edgeErrorString:
      "NOTE: Microsoft blocks extensions and does not allow them to work on special <edge://> pages such as the current page.",
    addonsErrorString:
      "NOTE: For this extension to work you must leave the Edge Addons store and go to another website. Microsoft blocks extensions from functioning on special pages such as this one.",

    isEdge: () => {
      try {
        // no regex match means user not on Edge
        return navigator.userAgent.match(/Edg\//) ? true : false;
      } catch (error) {
        // returns false if navigator.userAgent is not found
        return null;
      }
    },

    urlValid: (tab: chrome.tabs.Tab) => {
      // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
      let result = {
        message: "",
        valid: false,
      };
      if ("url" in tab) {
        if (tab.url?.match(/^edge/i)) {
          result.message = browserCheck.edge.edgeErrorString;
        } else if (tab.url?.match(/microsoftedge\.microsoft\.com\/addons/i)) {
          result.message = browserCheck.edge.addonsErrorString;
        } else {
          result.valid = true;
        }
      } else {
        throw new Error("Active tab has no url value");
      }
      return result;
    },
  },

  googlechrome: {
    // chrome specific url checking
    chromeErrorString:
      "NOTE: Google blocks extensions and does not allow them to work on special <chrome://> pages such as the current page.",
    webstoreErrorString:
      "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.",

    isChrome: () => {
      try {
        // no regex match means user not on Chrome
        return navigator.userAgent.match(/Chrome\//) ? true : false;
      } catch (error) {
        // returns false if navigator.userAgent is not found, user not using chrome-based browser
        return false;
      }
    },

    urlValid: (tab: chrome.tabs.Tab) => {
      // Extensions are not allowed in chrome settings pages or in the webstore. This function checks for these urls
      let result = {
        message: "",
        valid: false,
      };
      if ("url" in tab) {
        if (tab.url?.match(/^chrome/i)) {
          result.message = browserCheck.googlechrome.chromeErrorString;
        } else if (tab.url?.match(/chrome\.google.com\/webstore/i)) {
          result.message = browserCheck.googlechrome.webstoreErrorString;
        } else {
          result.valid = true;
        }
      } else {
        throw new Error("Active tab has no url value");
      }
      return result;
    },
  },

  opera: {
    // opera specific url checking
    chromeErrorString:
      "NOTE: Opera blocks extensions and does not allow them to work on special settings pages such as the current page.",
    addonsErrorString:
      "NOTE: For this addon to work you must leave addons.opera.com and go to another website. Opera blocks addons from functioning on special pages such as this one.",
    extensionSettings:
      "This page cannot be scripted due to an ExtensionsSettings policy.",
    popupWarning:
      'You must enable "Allow access to search page results" in Hanzisize extension settings for Hanzisize to work on this page',

    // determines if the user is on Opera or not
    isOpera: () => {
      try {
        // if no regex match = user not on Chrome
        return navigator.userAgent.match(/Opera|OPR\//) ? true : false;
      } catch (error) {
        // returns false if navigator.userAgent is not found
        return false;
      }
    },

    // addons are not allowed on addons.mozilla.org or settings pages. This function checks for these urls
    urlValid: (tab: chrome.tabs.Tab) => {
      let result = {
        message: "",
        valid: false,
      };
      if ("url" in tab) {
        if (tab.url?.match(/\/addons\.opera\.com/i)) {
          result.message = browserCheck.opera.addonsErrorString;
        } else if (tab.url?.match(/^chrome/i)) {
          result.message = browserCheck.opera.chromeErrorString;
        } else {
          result.valid = true;
        }
      } else {
        throw new Error("Active tab has no url value");
      }
      return result;
    },
  },

  getUserBrowser: () => {
    if (browserCheck.firefox.isFirefox() === true) {
      // user is on firefox
      return "firefox";
    } else if (browserCheck.opera.isOpera() === true) {
      // user is on opera
      return "opera";
    } else if (browserCheck.edge.isEdge() === true) {
      // user is on edge
      return "edge";
    } else if (browserCheck.googlechrome.isChrome() === true) {
      // test googlechrome last because the above browsers' useragent strings also contain the string "Chrome"
      return "chrome";
    } else {
      return "unknown";
    }
  },

  // check for disallowed urls by browser
  checkUrl: (tab: chrome.tabs.Tab, browser: string) => {
    let result = {
      valid: true,
      message: "",
    };
    switch (browser) {
      case "firefox":
        result = browserCheck.firefox.urlValid(tab);
        break;
      case "opera":
        result = browserCheck.opera.urlValid(tab);
        break;
      case "edge":
        result = browserCheck.edge.urlValid(tab);
        break;
      case "chrome":
        result = browserCheck.googlechrome.urlValid(tab);
        break;
    }
    return result;
  },
};

const chromeMethods = {
  // get active tab info
  getQueryResult: () => {
    return new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (response) =>
        resolve(response)
      );
    });
  },

  // get active tab info so we know where to inject the content script
  fetchTabInfo: async () => {
    const tabs = await chromeMethods.getQueryResult();
    const tab: chrome.tabs.Tab = tabs[0];

    console.log(`onAppMount.main tab ${JSON.stringify(tab)}`);
    // tab object validation
    if (!tab.id) {
      throw new Error("tab.id not defined");
    }
    if (!tab.url) {
      throw new Error("tab.url not defined");
    }

    return tab;
  },

  // fetch most recent font size and lang settings from chrome storage
  getFromStorage: async () => {
    let resultFS = await new Promise<FontSizeObject>((resolve) => {
      chrome.storage.local.get(["minFontSize"], (response) => {
        resolve(response as FontSizeObject);
      });
    });
    let resultLang = await new Promise<LanguageObject>((resolve) => {
      chrome.storage.local.get(["language"], (response) => {
        resolve(response as LanguageObject);
      });
    });

    // if either of the two values dont exist in storage, set them to default and save them in storage
    if (!resultFS || !resultFS.minFontSize) {
      console.log("getFromStorage minFontSize not found, setting to default");
      resultFS = { minFontSize: 0 };
    } else {
      console.log(`getFromStorage minFontSize: ${JSON.stringify(resultFS)}`);
    }
    if (!resultLang || !resultLang.language) {
      console.log("getFromStorage language not found, setting to default");
      resultLang = { language: "chinese" };
    } else {
      console.log(`getFromStorage language: ${JSON.stringify(resultLang)}`);
    }

    let resultObj: StoredData = {
      minFontSize: resultFS.minFontSize,
      language: resultLang.language,
    };

    console.log(`getFromStorage resultObj: ${JSON.stringify(resultObj)}`);
    return resultObj;
  },

  pushFSToStorage: (minFontSize: number) => {
    chrome.storage.local.set({ minFontSize: minFontSize }, () => {
      console.log(
        `tools.pushFSToStorage New minimum font size stored as: ${minFontSize}`
      );
    });
  },

  // push submitted language to chrome local storage
  pushLangToStorage: (language: string) => {
    chrome.storage.local.set({ language: language }, () => {
      console.log(
        `tools.pushLangToStorage New language stored as: ${language}`
      );
    });
  },
};

const scriptMethods = {
  contentResponse: {} as ContentResponse,
  firstResize: true,
  injectionError: "" as string | undefined,

  // Handle message response from first attempt at calling the content script
  handleFirstMessageResponse: (
    lastError: chrome.runtime.LastError | undefined,
    response: ContentResponse,
    tab_id: number,
    obj: ContentObject,
    _errorCallback?: ErrorCallbackFunc
  ) => {
    // if tab does not send back a response, the content script hasn't been injected yet
    if (lastError && !response) {
      console.log(
        `lastError: ${JSON.stringify(
          lastError
        )}, tools.sendToContent initial message send failed. injecting jquery...`
      );
      // First try to inject jquery into active tab. Requires "permissions": ["activeTab"] in manifest.json
      chrome.tabs.executeScript(
        tab_id,
        { file: "jquery-3.5.1.min.js" },
        function () {
          scriptMethods.handleJqueryInjection(
            chrome.runtime.lastError,
            tab_id,
            obj,
            _errorCallback
          );
        }
      );
    } else {
      scriptMethods.contentResponse = response;
      if (_errorCallback) {
        _errorCallback(
          scriptMethods.injectionError,
          scriptMethods.contentResponse
        );
      }
    }
  },

  // Handle response from jquery injection
  handleJqueryInjection: (
    lastError: chrome.runtime.LastError | undefined,
    tab_id: number,
    obj: ContentObject,
    _errorCallback?: ErrorCallbackFunc
  ) => {
    // if an error is returned, the user is probably trying to use the extension on a page that the browser doesn't allow (e.g. chrome webstore, addons.mozilla.org, etc.) or is using Opera on search results without the proper settings
    if (lastError) {
      scriptMethods.handleJqueryInjectErr(lastError, _errorCallback);
    } else {
      console.log("jquery injected. injecting content script...");
      // If jquery injects properly, inject contentScript.js in active tab. Requires "permissions": ["activeTab"] in manifest.json
      scriptMethods.injectContentScript(tab_id, obj, _errorCallback);
    }
  },

  handleJqueryInjectErr: (
    lastError: chrome.runtime.LastError,
    _errorCallback?: ErrorCallbackFunc
  ) => {
    console.log(`jquery injection error: ${JSON.stringify(lastError)}`);

    // Opera throws the following error if extension is used on google search results without first given permission
    if (lastError.message === browserCheck.opera.extensionSettings) {
      console.log(
        "extension called on google search results with setting disabled"
      );

      scriptMethods.injectionError = browserCheck.opera.popupWarning;
    } else {
      scriptMethods.injectionError = lastError.message;
    }
    if (_errorCallback) {
      _errorCallback(
        scriptMethods.injectionError,
        scriptMethods.contentResponse
      );
    }
  },

  // Inject contentScript after jquery has been injected
  injectContentScript: (
    tab_id: number,
    obj: ContentObject,
    _errorCallback?: ErrorCallbackFunc
  ) => {
    chrome.tabs.executeScript(
      tab_id,
      { file: "contentScript.js" },
      function () {
        // console.log(`executeScript: ${JSON.stringify(chrome.runtime.lastError)}`)
        if (chrome.runtime.lastError) {
          console.log(
            `content script injection error ${chrome.runtime.lastError.message}`
          );
          scriptMethods.injectionError = chrome.runtime.lastError.message;
          if (_errorCallback) {
            _errorCallback(
              scriptMethods.injectionError,
              scriptMethods.contentResponse
            );
          }
        } else {
          // if contentScript.js has been successfully injected, call sendMessage a second time to finally send the object to the active tab
          console.log("contentScript injected. setting mode to initial");
          scriptMethods.firstResize = true;
          obj.mode = "initial";
          scriptMethods.secondMessageToScript(tab_id, obj, _errorCallback);
        }
      }
    );
  },

  // Send final message containing the data retrieved from chrome storage and the tab info after all scripts have been injected
  secondMessageToScript: (
    tab_id: number,
    obj: ContentObject,
    _errorCallback?: ErrorCallbackFunc
  ) => {
    try {
      chrome.tabs.sendMessage(tab_id, obj, { frameId: 0 }, (response) => {
        console.log(
          `secondMesageToScript recieved response: ${JSON.stringify(response)}`
        );
        scriptMethods.contentResponse = response;
        if (_errorCallback) {
          _errorCallback(
            scriptMethods.injectionError,
            scriptMethods.contentResponse
          );
        }
      });
    } catch (error) {
      console.log(`scripts injected, but message could not be sent. ${error}`);
    }
  },

  // prepare info that will be send to the njected content script
  createContentObj: (storedData: StoredData, mode: string) => {
    const contentObj = {
      language: storedData.language,
      minFontSize: storedData.minFontSize,
      mode: mode,
    };
    console.log(`creating content object: ${JSON.stringify(contentObj)}`);
    return contentObj;
  },

  // this function gets called on initial load of the extension as well as every time the user selects a new language or changes minFontSize
  sendToContent: (
    tab_id: number,
    obj: ContentObject,
    _errorCallback?: ErrorCallbackFunc
  ) => {
    // attempt to send object to content script
    console.log(
      `sending message to contentScript with args: ${tab_id}, ${JSON.stringify(
        obj
      )}, {frameId: 0}, callback()`
    );

    chrome.tabs.sendMessage(tab_id, obj, { frameId: 0 }, (response) => {
      scriptMethods.handleFirstMessageResponse(
        chrome.runtime.lastError,
        response,
        tab_id,
        obj,
        _errorCallback
      );

      console.log(
        `sendToContent recieved response: ${JSON.stringify(response)}`
      );
    });
  },

  main: async (
    mode: string,
    typeOfCall: string,
    sendResponse?: (response?: any) => void,
    data?: StoredData
  ) => {
    console.log(`activating main function with args: ${mode}, ${typeOfCall}`);

    let urlCheck: ValidityCheck;
    let storedData: StoredData;
    let messageResponse: Object;

    // get tab id
    const tabInfo = await chromeMethods.fetchTabInfo();
    // make sure tab url is valid
    const userBrowser = browserCheck.getUserBrowser();

    urlCheck = browserCheck.checkUrl(tabInfo, userBrowser);

    // display error in popup if url is invalid
    if (!urlCheck.valid) {
      if (typeOfCall === "popup" && sendResponse) {
        // sendResponse({invalidUrlMessage: urlCheck.message})
        messageResponse = { invalidUrlMessage: urlCheck.message };
        return messageResponse;
      } else {
        return;
      }
    }

    // use lang and min font size if they are supplied, otherwise get them from chrome storage
    if (data) {
      storedData = data;
    } else {
      storedData = await chromeMethods.getFromStorage();
    }

    // prepare object to send to contentScript
    const contentObj = scriptMethods.createContentObj(storedData, mode);

    console.log(
      `background script sending content obj: ${JSON.stringify(contentObj)}`
    );

    // send data to commence script injection and resizing
    if (tabInfo.id) {
      if (typeOfCall === "popup" && sendResponse) {
        // only display errors via callback function if popup is open

        console.log(
          `background script sending to contentScript: ${JSON.stringify(
            `tabInfo.id: ${tabInfo.id}, contentObj: ${contentObj}, callback`
          )}`
        );

        const contentResponse = scriptMethods.sendToContent(
          tabInfo.id,
          contentObj,
          (injectionErr, response) => {
            const responseObject = {
              injectionError: injectionErr,
              multipleFrames: response.multipleFrames,
            };

            // pass info back to app.js
            console.log(
              `background script sending response to app.js: ${JSON.stringify(
                responseObject
              )}`
            );

            return responseObject;
          }
        );
        return contentResponse;
      } else {
        // no errors displayed for hotkey or storage changes

        console.log(
          `background script sending to contentScript: ${JSON.stringify(
            `tabInfo.id: ${tabInfo.id}, contentObj: ${contentObj}`
          )}`
        );
        scriptMethods.sendToContent(tabInfo.id, contentObj);
      }
    } else {
      throw new Error('Tab has no "id" value');
    }
  },
};

// listen for hotkey
chrome.commands.onCommand.addListener(function (command) {
  console.log("command:", command);

  if (command === "resize") {
    let mode;
    scriptMethods.firstResize === true ? (mode = "initial") : (mode = "resize");
    scriptMethods.firstResize = false;

    console.log(
      `Resize command recieved. Calling main function with args mode: ${mode}, typeOfCall: 'hotkey'.`
    );
    scriptMethods.main(mode, "hotkey");
  }
});

// listen for popup message from app.js
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.message === "popup opened") {
    console.log("received message 'popup opened'");
    let mode;
    scriptMethods.firstResize === true ? (mode = "initial") : (mode = "resize");
    scriptMethods.firstResize = false;

    console.log(
      `Received message 'popup opened'. Calling main function with args mode: ${mode}, typeOfCall: 'popup', sendResponse: sendResponse`
    );

    return scriptMethods.main(mode, "popup", sendResponse, request.data);
  } else if (request.message === "get stored data") {
    console.log("background.js received message 'get stored data'");

    const storedData = await chromeMethods.getFromStorage();

    console.log(`background.js sending response ${JSON.stringify(storedData)}`);

    return storedData;
  } else if (request.message === "handle lang change") {
    chromeMethods.pushLangToStorage(request.language);
    return "lang change pushed to chrome.storage";
  } else if (request.message === "handle font size change") {
    chromeMethods.pushFSToStorage(request.minFontSize);
    return "font size change pushed to chrome.storage";
  }
});

// listen for changes in chrome.storage
chrome.storage.onChanged.addListener(function (changes, namespace) {
  console.log("listening for changes in chrome.storage");
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if ("language" in changes) {
      console.log(
        `language value in chrome storage changed from ${changes.language.oldValue} to ${changes.language.newValue}`
      );

      // activate langage resizing
      console.log(
        `Calling main function with args mode: 'lang-change', typeOfCall: 'storage-change'`
      );
      scriptMethods.main("lang-change", "storage-change");
    }
    if ("minFontSize" in changes) {
      console.log(
        `minFontSize value in chrome storage changed from ${changes.minFontSize.oldValue} to ${changes.minFontSize.newValue}`
      );

      // activate minfontsize resizing
      console.log(
        `Calling main function with args mode: 'fontsize-change', typeOfCall: 'storage-change'`
      );
      scriptMethods.main("fontsize-change", "storage-change");
    }
  }
});

console.log("background page loaded...");

try {
  module.exports = {
    browserCheck: browserCheck,
    chromeMethods: chromeMethods,
    scriptMethods: scriptMethods,
  };
} catch (err) {
  console.log(
    err +
      ".  'module' only necessary for testing purposes. Not needed in production."
  );
}
