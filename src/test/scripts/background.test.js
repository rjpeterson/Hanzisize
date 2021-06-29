const { browserCheck, chromeMethods, scriptMethods } = require("../../../public/background");

describe('browserCheck', () => {
  let mockTab;
  global.browser = {runtime: {}};

  beforeEach(() => {
    mockTab = {url: 'google.com', id: 1};
    global.browser = {runtime: {}};
  })

  afterEach(() => {
    jest.restoreAllMocks();
  })

  describe('firefox', () => {
    describe('isFirefox', () => {
      test('it returns true when the getBrowserInfo function exists', () => {
        global.browser = {
          runtime: {
            getBrowserInfo: jest.fn()
          }
        }
  
        const result = browserCheck.firefox.isFirefox();
  
        expect(result).toBeTruthy();
        global.browser = {runtime: {}};
      })
  
      test('it returns false when the getBrowserInfo function does not exist', () => {
        const result = browserCheck.firefox.isFirefox();
  
        expect(result).toBeFalsy();
      })
    })
  
    describe('urlValid', () => {
      test('a valid url should return valid=true', () => {
        const expected = {message: '', valid: true}
        
        const result = browserCheck.firefox.urlValid(mockTab)
    
        expect(result).toEqual(expected);
      })
    
      test('an addons url should return addons error text', () => {
        const tab = {url: 'https://addons.mozilla.org/en-US/firefox/'}
        const expected = {message: browserCheck.firefox.addonsErrorString, valid: false}
        
        const result = browserCheck.firefox.urlValid(tab)
    
        expect(result).toEqual(expected);
      })
    })
  })
  
  describe('edge', () => {
    describe('isEdge', () => {
      let userAgentGetter;
      
      beforeEach(() => {
        userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
      })
  
      test('it returns a truthy string when navigator.userAgent contains the string "Edg"', () => {
        userAgentGetter.mockReturnValue("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43")
  
        const result = browserCheck.edge.isEdge();
  
        expect(result).toBeTruthy();
      })
  
      test('it returns null when navigator.userAgent does not contain the string "Edg"', () => {
        userAgentGetter.mockReturnValue('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0');
  
        const result = browserCheck.edge.isEdge();
  
        expect(result).toBeFalsy();
      })
    })
  
    describe('urlValid', () => {
      test('a valid url should return valid=true', () => {
        const expected = {message: '', valid: true}
        
        const result = browserCheck.edge.urlValid(mockTab)
    
        expect(result).toEqual(expected);
      })
    
      test('a edge addons url should return addons error text', () => {
        const tab = {url: 'https://microsoftedge.microsoft.com/addons'}
        const expected = {message: browserCheck.edge.addonsErrorString, valid: false}
        
        const result = browserCheck.edge.urlValid(tab)
    
        expect(result).toEqual(expected);
      })
    })
  })
  
  describe('googlechrome', () => {
    describe('isChrome', () => {
      let userAgentGetter;
      
      beforeEach(() => {
        // navigator object cannot be directly modified so we mock it here
        userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
      })
  
      test('it returns a truthy string when navigator.userAgent contains the word "Chrome"', () => {
        userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36 OPR/70.0.3728.154')
  
        const result = browserCheck.googlechrome.isChrome();
  
        expect(result).toBeTruthy();
      })
  
      test('it returns null when navigator.userAgent does not contain the word "Chrome"', () => {
        userAgentGetter.mockReturnValue('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0');
  
        const result = browserCheck.googlechrome.isChrome();
  
        expect(result).toBeFalsy();
      })
    })
  
    describe('urlValid', () => {
      test('a valid url should return string valid=true', () => {
        const expected = {message: '', valid: true}
        
        const result = browserCheck.googlechrome.urlValid(mockTab)
    
        expect(result).toEqual(expected);
      })
    
      test('a webstore url should return webstore error text', () => {
        const tab = {url: 'https://chrome.google.com/webstore/category/extensions'}
        const expected = {message: browserCheck.googlechrome.webstoreErrorString, valid: false}
        
        const result = browserCheck.googlechrome.urlValid(tab)
    
        expect(result).toEqual(expected);
      })
    })
  })
  
  describe('opera', () => {
    describe('isOpera', () => {
      let userAgentGetter;
      
      beforeEach(() => {
        // navigator object cannot be directly modified so we mock it here
        userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
      })
  
      test('it returns a truthy string when navigator.userAgent contains the word "Opera" or the string "OPR"', () => {
        userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36 OPR/70.0.3728.154')
  
        const result = browserCheck.opera.isOpera();
  
        expect(result).toBeTruthy();
      })
  
      test('it returns null when navigator.userAgent does not contain the word "Opera" or the string "OPR"', () => {
        userAgentGetter.mockReturnValue('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0');
  
        const result = browserCheck.opera.isOpera();
  
        expect(result).toBeFalsy();
      })
    })
  
    describe('urlValid', () => {
      test('a valid url should return string valid=true', () => {
        const expected = {message: '', valid: true}
        
        const result = browserCheck.opera.urlValid(mockTab)
    
        expect(result).toEqual(expected);
      })
    
      test('a opera addons url should return addons error text', () => {
        const tab = {url: 'https://addons.opera.com'}
        const expected = {message: browserCheck.opera.addonsErrorString, valid: false}
        
        const result = browserCheck.opera.urlValid(tab)
    
        expect(result).toEqual(expected);
      })
    })
  })
  
  describe('getUserBrowser', () => {
    let spyFF;
    let spyOP;
    let spyED;
    let spyGC;
    
    beforeEach(()=>{
      spyFF = jest.spyOn(browserCheck.firefox, 'isFirefox').mockReturnValue(false);
      spyOP = jest.spyOn(browserCheck.opera, 'isOpera').mockReturnValue(false);
      spyED = jest.spyOn(browserCheck.edge, 'isEdge').mockReturnValue(false);
      spyGC = jest.spyOn(browserCheck.googlechrome, 'isChrome').mockReturnValue(false);
    })

    test('it returns "firefox" when isFirefox returns true', () => {
      spyFF.mockReturnValue(true);
      const expected = 'firefox';

      const result = browserCheck.getUserBrowser();

      expect(spyFF).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it returns "chrome" after testing all other browsers when isChrome returns true', () => {
      spyGC.mockReturnValue(true);
      const expected = 'chrome';

      const result = browserCheck.getUserBrowser();

      
      expect(spyFF).toHaveBeenCalledTimes(1);
      expect(spyOP).toHaveBeenCalledTimes(1);
      expect(spyED).toHaveBeenCalledTimes(1);
      expect(spyGC).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it returns "unknown" when all browserCheck functions return false', () => {
      const expected = 'unknown';

      const result = browserCheck.getUserBrowser();

      expect(spyFF).toHaveBeenCalledTimes(1);
      expect(spyOP).toHaveBeenCalledTimes(1);
      expect(spyED).toHaveBeenCalledTimes(1);
      expect(spyGC).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })
  })
  
  describe('checkUrl', () => {
    let resultObject;
    let spyFF;
    let spyOP;
    let spyED;
    let spyGC;
    
    beforeEach(()=>{
      resultObject = {valid: false, message: 'test'}
      spyFF = jest.spyOn(browserCheck.firefox, 'urlValid').mockReturnValue(resultObject);
      spyOP = jest.spyOn(browserCheck.opera, 'urlValid').mockReturnValue(resultObject);
      spyED = jest.spyOn(browserCheck.edge, 'urlValid').mockReturnValue(resultObject);
      spyGC = jest.spyOn(browserCheck.googlechrome, 'urlValid').mockReturnValue(resultObject);
    })

    test('it calls firefox.urlValid when passed "firefox"', () => {
      const expected = resultObject;

      const result = browserCheck.checkUrl(mockTab, 'firefox');

      expect(spyFF).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it calls googlechrome.urlValid when passed "chrome"', () => {
      const expected = resultObject;

      const result = browserCheck.checkUrl(mockTab, 'chrome');

      expect(spyGC).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it returns a default object when given an unknown browser', () => {
      const expected = {valid: true, message: ''};

      const result = browserCheck.checkUrl(mockTab, 'unknown');

      expect(result).toEqual(expected);
    })
  })
})

describe('chromeMethods', () => {
  let mockStoredObject;
  let defaultStoredObject;
  let mockTab;
  global.browser = {runtime: {}};
  
  beforeEach(()=> {
    mockTab = {url: 'google.com', id: 1};
    global.browser = {runtime: {}};
    mockStoredObject = {'minFontSize': 10, 'language': 'arabic'};
    defaultStoredObject = {'minFontSize': 0, 'language': 'chinese'};

    global.chrome = {
      storage: {
        local: {
          set: jest.fn().mockReturnValue(10),
          get: jest.fn((valueArray, _callback) => {
            const valueToGet = valueArray[0];
            const mFSObj = {'minFontSize': 10};
            const langObj = {'language': 'arabic'};
            const returnObj = (valueToGet === 'language') ? langObj : mFSObj;
            _callback(returnObj)
          })
        }
      },
      tabs: {
        query: jest.fn((obj, callback) => {callback([mockTab])})
      }
    }
  })

  afterEach(() => {
    jest.restoreAllMocks();
  })

  describe('getQueryResult', () => {
    test('it queries the chrome api for tab info and returns the tab array', async () => {
      const result = await chromeMethods.getQueryResult();

      expect(result).toEqual([mockTab])
    })
  })

  describe('fetchTabInfo', () => {
    test('it calls getQueryResult and returns a tab object', async () => {
      const spy = jest.spyOn(chromeMethods, 'getQueryResult')
      spy.mockReturnValue([mockTab]);

      const result = await chromeMethods.fetchTabInfo();

      expect(result).toEqual(mockTab);
    })
  })

  describe('getFromStorage', () => {

    describe('storage contains values', () => {

      test('it returns stored language and minfontsize values', async () => {
        const result = await chromeMethods.getFromStorage();
      
        expect(chrome.storage.local.get).toHaveBeenCalledTimes(2);
        expect(result).toEqual(mockStoredObject);
      })

    })

    describe('storage is empty', () => {

      test('it returns default values', async () => {
        global.chrome.storage.local = {
          get: jest.fn((valueArray, _callback) => {
          const returnObj = {}
          _callback(returnObj)
          })
        }

        const result = await chromeMethods.getFromStorage();

        expect(chrome.storage.local.get).toHaveBeenCalledTimes(2);
        expect(result).toEqual(defaultStoredObject);
      })

    })

  })

  describe('pushFSToStorage', () => {
    test('sends a font size value to chrome storage', () => {
      const inputArg = 10;
      chromeMethods.pushFSToStorage(inputArg);
      expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        minFontSize: inputArg
      }, expect.any(Function))
    }) 
  })
  
  describe('pushLangToStorage', () => {
    test('sends a language value to chrome storage', () => {
      const inputArg = 'arabic';
      chromeMethods.pushLangToStorage(inputArg);
      expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        language: inputArg
      }, expect.any(Function))
    }) 
  })
})

describe('scriptMethods', () => {
  let mockCallback = jest.fn();
  let mockTab;
  let mockStoredObject

  beforeEach(() => {
    mockTab = {url: 'google.com', id: 1};
    mockStoredObject = {'minFontSize': 10, 'language': 'arabic'};

    global.chrome = {
      runtime: {
        lastError: {
          message: 'mock error'
        }
      },
      tabs: {
        sendMessage: jest.fn((tab_id, object, frameObj, callback) => {
          callback('message response')
        }),
        executeScript: jest.fn((tab_id, object, callback) => {
          chrome.runtime.lastError = undefined;
          callback();
        }),
        query: jest.fn((obj, callback) => {callback([mockTab])})
      }
    }
  })

  afterEach(() => {
    jest.restoreAllMocks();
    mockCallback.mockReset();
  })

  describe('handleFirstMessageResponse', () => {
    let response;
    const tabId = 1
    const obj = {mock: 'obj'};

    test('injects scripts if no response', () => {
      response = false;
      const spy = jest.spyOn(scriptMethods, 'handleJqueryInjection').mockImplementation(() => {})
  
      scriptMethods.handleFirstMessageResponse(chrome.runtime.lastError, response, tabId, obj, mockCallback);

      expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: process.env.PUBLIC_URL + 'jquery-3.5.1.min.js'}, expect.any(Function));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(undefined, tabId, obj, mockCallback);
    })

    test('sets response variable if message recieved', () => {
      chrome.runtime.lastError = undefined;
      response = true;

      scriptMethods.handleFirstMessageResponse(chrome.runtime.lastError, response, tabId, obj, mockCallback);

      expect(scriptMethods.contentResponse).toEqual(response);
      expect(mockCallback).toHaveBeenCalledWith(scriptMethods.injectionError, response)
    })
  })

  describe('handleJqueryInjection', () => {
    const tabId = 1;
    const obj = {mock: 'obj'};

    test('it passes errors to the error handler', () => {
      chrome.runtime.lastError = true;
      const spy = jest.spyOn(scriptMethods, "handleJqueryInjectErr")

      scriptMethods.handleJqueryInjection(chrome.runtime.lastError, tabId, obj, mockCallback);

      expect(spy).toHaveBeenCalledWith(chrome.runtime.lastError, mockCallback);
    })

    test('if there is no error, it injects content script', () => {
      chrome.runtime.lastError = false;
      const spy = jest.spyOn(scriptMethods, "injectContentScript")

      scriptMethods.handleJqueryInjection(chrome.runtime.lastError, tabId, obj, mockCallback);

      expect(spy).toHaveBeenCalledWith(tabId, obj, mockCallback);
    })
  })

  describe('handleJqueryInjectErr', () => {
    test('it tests for Opera Settings',() => {
      const testErr = {message: browserCheck.opera.extensionSettings}
      scriptMethods.contentResponse = 'test'

      scriptMethods.handleJqueryInjectErr(testErr, mockCallback);

      expect(scriptMethods.injectionError).toEqual(browserCheck.opera.popupWarning);
      expect(mockCallback).toHaveBeenCalledWith(browserCheck.opera.popupWarning, scriptMethods.contentResponse)
    })

    test('it passes non-Opera-settings-errors through',() => {
      const testErr = {message: 'mock error'};

      scriptMethods.handleJqueryInjectErr(testErr, mockCallback);

      expect(scriptMethods.injectionError).toEqual(testErr.message);
      expect(mockCallback).toHaveBeenCalledWith(scriptMethods.injectionError, scriptMethods.contentResponse)
    })
  })

  describe('injectContentScript', () => {
    const tabId = 1;
    const obj = {mock: 'obj'};

    afterEach(() => {
      jest.restoreAllMocks();
    })

    test('script fails to inject and returns correct injection error', () => {
      chrome.tabs.executeScript = jest.fn((tab_id, object, _callback) => {
        _callback();
      })

      scriptMethods.injectContentScript(tabId, obj, mockCallback);

      expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: 'contentScript.js'}, expect.any(Function))
      expect(scriptMethods.injectionError).toEqual(chrome.runtime.lastError.message)
      expect(mockCallback).toHaveBeenCalledWith(scriptMethods.injectionError, scriptMethods.contentResponse)
    })

    test('script successfully injects', () => {
      const spy = jest.spyOn(scriptMethods, 'secondMessageToScript').mockImplementation(()=>{});

      scriptMethods.injectContentScript(tabId, obj, mockCallback);
      expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: 'contentScript.js'}, expect.any(Function))
      expect(spy).toHaveBeenCalledWith(tabId, obj, mockCallback)
      expect(mockCallback).toHaveBeenCalledTimes(0)
      expect(scriptMethods.firstResize).toBeTruthy();
      scriptMethods.firstResize = false;
    })
  })
  
  describe('secondMessageToScript', () => {
    const tabId = 1;
    const obj = {mock: 'obj'};

    test('it sends the message to the content script', () => {
      scriptMethods.secondMessageToScript(tabId, obj, mockCallback);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, obj, {frameId: 0}, expect.any(Function));
      expect(scriptMethods.contentResponse).toEqual('message response')
      expect(mockCallback).toHaveBeenCalledWith(scriptMethods.injectionError, scriptMethods.contentResponse)
    })
  });

  describe('createContentObj', () => {
    test('it combines storedData and mode into a content objetc', () => {
      const expected = {language: mockStoredObject.language, minFontSize: mockStoredObject.minFontSize, mode: 'mode'};

      const result = scriptMethods.createContentObj(mockStoredObject, 'mode')

      expect(result).toEqual(expected)
    })
  })

  describe('sendToContent', () => {
    const tabId = 1;
    const obj = {mock: 'object'};

    test('it send the object to the tab and passes any response to the handler function', () => {      
      const spyCTSM = jest.spyOn(chrome.tabs, 'sendMessage');
      const spyHFMR = jest.spyOn(scriptMethods, 'handleFirstMessageResponse');

      scriptMethods.sendToContent(tabId, obj, mockCallback);

      expect(spyCTSM).toHaveBeenCalledWith(tabId, obj, {frameId: 0}, expect.any(Function));
      expect(spyHFMR).toHaveBeenCalledWith(chrome.runtime.lastError, 'message response', tabId, obj, mockCallback);
    })
  })

  describe('main', () => {
    let spyFTI;
    let spyGUB;
    let spyCU;
    let spyGFS;
    let spyCCO;
    let spySTC;
    let urlCheckResult;
    let mockUserBrowser;
    let mockContentObj;
    let mockCallbackReturn;

    beforeEach(()=> {
      urlCheckResult = {valid: true, message: ''}
      mockUserBrowser = 'user browser'
      mockContentObj = {value: 'data'}
      mockCallbackReturn = {value: 'mock callback return'}
      mockCallback.mockReturnValue(mockCallbackReturn)
      spyFTI = jest.spyOn(chromeMethods, 'fetchTabInfo')
      spyFTI.mockImplementation(()=>{return mockTab})

      spyGUB = jest.spyOn(browserCheck, 'getUserBrowser')
      spyGUB.mockImplementation(()=>{return mockUserBrowser})

      spyCU = jest.spyOn(browserCheck, 'checkUrl')
      spyCU.mockImplementation(()=>{return urlCheckResult})

      spyGFS = jest.spyOn(chromeMethods, 'getFromStorage').mockReturnValue(mockStoredObject)
      spyCCO = jest.spyOn(scriptMethods, 'createContentObj').mockReturnValue(mockContentObj)
      spySTC = jest.spyOn(scriptMethods, 'sendToContent').mockReturnValue(mockCallbackReturn)
    })

    afterEach(() => {
      jest.restoreAllMocks();
    })

    test('popup on invalid url return invalidUrlMessage object', async() => {
      const mode = 'initial'
      const typeOfCall = 'popup'
      const urlCheckFail = {valid: false, message: 'url invalid'}
      const expected = {invalidUrlMessage: urlCheckFail.message}
      spyCU.mockImplementation(() => {return urlCheckFail})

      const result = await scriptMethods.main(mode, typeOfCall, mockCallback, mockStoredObject)

      expect(spyFTI).toHaveBeenCalledTimes(1)
      expect(spyGUB).toHaveBeenCalledTimes(1)
      expect(spyCU).toHaveBeenCalledTimes(1)
      expect(spyCU).toHaveBeenCalledWith(mockTab, mockUserBrowser)
      expect(result).toEqual(expected)
      expect(spyGFS).toHaveBeenCalledTimes(0)
      expect(spyCCO).toHaveBeenCalledTimes(0)
      expect(spySTC).toHaveBeenCalledTimes(0)
      spyCU.mockImplementation(() => {return urlCheckResult})
    })

    test('popup on valid url with data supplied', async () => {
      const mode = 'initial'
      const typeOfCall = 'popup'
      const expected = mockCallbackReturn

      const result = await scriptMethods.main(mode, typeOfCall, mockCallback, mockStoredObject)

      expect(spyFTI).toHaveBeenCalledTimes(1)
      expect(spyGUB).toHaveBeenCalledTimes(1)
      expect(spyCU).toHaveBeenCalledTimes(1)
      expect(spyCU).toHaveBeenCalledWith(mockTab, mockUserBrowser)
      expect(spyGFS).toHaveBeenCalledTimes(0)
      expect(spyCCO).toHaveBeenCalledTimes(1)
      expect(spyCCO).toHaveBeenCalledWith(mockStoredObject, mode)
      expect(spySTC).toHaveBeenCalledTimes(1)
      expect(spySTC).toHaveBeenCalledWith(mockTab.id, mockContentObj, expect.any(Function))
      expect(result).toEqual(expected)
    })

    test('popup on valid url without data supplied', async () => {
      const mode = 'initial'
      const typeOfCall = 'popup'
      const expected = mockCallbackReturn

      const result = await scriptMethods.main(mode, typeOfCall, mockCallback)

      expect(spyFTI).toHaveBeenCalledTimes(1)
      expect(spyGUB).toHaveBeenCalledTimes(1)
      expect(spyCU).toHaveBeenCalledTimes(1)
      expect(spyCU).toHaveBeenCalledWith(mockTab, mockUserBrowser)
      expect(spyGFS).toHaveBeenCalledTimes(1)
      expect(spyCCO).toHaveBeenCalledTimes(1)
      expect(spyCCO).toHaveBeenCalledWith(mockStoredObject, mode)
      expect(spySTC).toHaveBeenCalledTimes(1)
      expect(spySTC).toHaveBeenCalledWith(mockTab.id, mockContentObj, expect.any(Function))
      expect(result).toEqual(expected)
    })

    test('activated with hotkey with no data supplied', async () => {
      const mode = 'resize'
      const typeOfCall = 'hotkey'

      await scriptMethods.main(mode, typeOfCall)

      expect(spyFTI).toHaveBeenCalledTimes(1)
      expect(spyGUB).toHaveBeenCalledTimes(1)
      expect(spyCU).toHaveBeenCalledTimes(1)
      expect(spyCU).toHaveBeenCalledWith(mockTab, mockUserBrowser)
      expect(spyGFS).toHaveBeenCalledTimes(1)
      expect(spyCCO).toHaveBeenCalledTimes(1)
      expect(spyCCO).toHaveBeenCalledWith(mockStoredObject, mode)
      expect(spySTC).toHaveBeenCalledTimes(1)
      expect(spySTC).toHaveBeenCalledWith(mockTab.id, mockContentObj)
    })
  })
})