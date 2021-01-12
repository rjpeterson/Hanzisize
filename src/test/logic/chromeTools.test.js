import { FilterFramesOutlined } from '@material-ui/icons';
import tools from '../../logic/chromeTools';

const mockStoredObject = {'minFontSize': 10, 'language': 'chinese'};
const mockCallback = jest.fn();

describe('chromeTools', () => {
  beforeEach(() => {
    global.chrome = {
      runtime: {
        lastError: {
          message: 'mock error'
        }
      },
      storage: {
        local: {
          set: jest.fn().mockReturnValue(10),
          get: jest.fn((array, _callback) => {_callback(mockStoredObject)})
        }
      },
      tabs: {
        sendMessage: jest.fn((tab_id, object, frameObj, callback) => {
          callback('message response')
        }),
        executeScript: jest.fn((tab_id, object, callback) => {
          chrome.runtime.lastError = false;
          callback();
        })
      }
    }
  })

  afterEach(() => {
    jest.restoreAllMocks();
  })
  
  describe('pushFSToStorage', () => {
    test('sends a font size value to chrome storage', () => {
      const inputArg = 10;
      tools.pushFSToStorage(inputArg);
      expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        minFontSize: inputArg
      }, expect.any(Function))
    }) 
  })
  
  describe('pushLangToStorage', () => {
    test('sends a language value to chrome storage', () => {
      const inputArg = 'chinese';
      tools.pushLangToStorage(inputArg);
      expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        language: inputArg
      }, expect.any(Function))
    }) 
  })
  
  describe('getFromStorage', () => {

    test('it returns stored language and minfontsize values', async () => {
      const result = await tools.getFromStorage();
      expect(chrome.storage.local.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStoredObject);
    })
  })

  describe('handleFirstMessageResponse', () => {
    let response;
    const tabId = 1
    const obj = {mock: 'obj'};

    test('injects scripts if no response', () => {
      response = false;
      const spy = jest.spyOn(tools, 'handleJqueryInjection').mockImplementation(() => {})
  
      tools.handleFirstMessageResponse(chrome.runtime.lastError, response, tabId, obj, mockCallback);

      expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: process.env.PUBLIC_URL + 'jquery-3.5.1.slim.min.js'}, expect.any(Function));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(false, tabId, obj, mockCallback);
    })

    test('sets response variable if message recieved', () => {
      chrome.runtime.lastError = false;
      response = true;

      tools.handleFirstMessageResponse(chrome.runtime.lastError, response, tabId, obj, mockCallback);

      expect(tools.contentResponse).toEqual(response);
      expect(mockCallback).toHaveBeenCalledWith(tools.injectionError, response)
    })
  })

  describe('handleJqueryInjection', () => {
    const tabId = 1;
    const obj = {mock: 'obj'};

    test('it passes errors to the error handler', () => {
      chrome.runtime.lastError = true;
      const spy = jest.spyOn(tools, "handleJqueryInjectErr")

      tools.handleJqueryInjection(chrome.runtime.lastError, tabId, obj, mockCallback);

      expect(spy).toHaveBeenCalledWith(chrome.runtime.lastError, mockCallback);
    })

    test('if there is no error, it injects content script', () => {
      chrome.runtime.lastError = false;
      const spy = jest.spyOn(tools, "injectContentScript")

      tools.handleJqueryInjection(chrome.runtime.lastError, tabId, obj, mockCallback);

      expect(spy).toHaveBeenCalledWith(tabId, obj, mockCallback);
    })
  })

  describe('handleJqueryInjectErr', () => {
    test('it tests for Opera Settings',() => {
      const testErr = {message: tools.operaErrors.extensionSettings}

      tools.handleJqueryInjectErr(testErr, mockCallback);

      expect(tools.injectionError).toEqual(tools.operaErrors.popupWarning);
      expect(mockCallback).toHaveBeenCalledWith(tools.injectionError, tools.contentResponse)
    })

    test('it passes non-Opera-settings-errors through',() => {
      const testErr = {message: 'mock error'};

      tools.handleJqueryInjectErr(testErr, mockCallback);

      expect(tools.injectionError).toEqual(testErr.message);
      expect(mockCallback).toHaveBeenCalledWith(tools.injectionError, tools.contentResponse)
    })
  })

  describe('injectContentScript', () => {
    const tabId = 1;
    const obj = {mock: 'obj'};

    test('script fails to inject and returns correct injection error', () => {
      chrome.tabs.executeScript = jest.fn((tab_id, object, _callback) => {
        _callback();
      })

      tools.injectContentScript(tabId, obj, mockCallback);

      expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: process.env.PUBLIC_URL + '/contentScript.js'}, expect.any(Function))
      expect(tools.injectionError).toEqual(chrome.runtime.lastError.message)
      expect(mockCallback).toHaveBeenCalledWith(tools.injectionError, tools.contentResponse)
    })

    test('script successfully injects', () => {
      const spy = jest.spyOn(tools, 'secondMessageToScripts').mockImplementation(()=>{});

      tools.injectContentScript(tabId, obj, mockCallback);
      expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: process.env.PUBLIC_URL + '/contentScript.js'}, expect.any(Function))
      expect(spy).toHaveBeenCalledWith(tabId, obj, mockCallback)
      expect(mockCallback).toHaveBeenCalledTimes(0)
    })
  })
  
  describe('secondMessageToScripts', () => {
    const tabId = 1;
    const obj = {mock: 'obj'};

    test('it sends the message to the content script', () => {
      tools.secondMessageToScripts(tabId, obj, mockCallback);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, obj, {frameId: 0}, expect.any(Function));
      expect(tools.contentResponse).toEqual('message response')
      expect(mockCallback).toHaveBeenCalledWith(tools.injectionError, tools.contentResponse)
    })
  });

  describe('sendToContent', () => {
    const tabId = 1;
    const obj = {mock: 'object'};

    test('it send the object to the tab and passes any response to the handler function', () => {
      const spy = jest.spyOn(tools, 'handleFirstMessageResponse');

      tools.sendToContent(tabId, obj, mockCallback);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, obj, {frameId: 0}, expect.any(Function));
      expect(spy).toHaveBeenCalledWith(chrome.runtime.lastError, 'message response', tabId, obj, mockCallback);
    })

    // describe('initial call', () => {
    //   test('sends message, fails, injects content script and sends message again', () => {
      
    //     tools.sendToContent(tabId, obj, callback);
      
    //     expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2);
    //     expect(chrome.tabs.sendMessage).toHaveBeenNthCalledWith(1, tabId, obj, {frameId: 0}, expect.any(Function))
    //     expect(chrome.tabs.sendMessage).toHaveBeenNthCalledWith(2, tabId, obj, {frameId: 0}, expect.any(Function))
    //     expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(2);
    //     expect(chrome.tabs.executeScript).toHaveBeenNthCalledWith(1,tabId, {file: process.env.PUBLIC_URL + 'jquery-3.5.1.slim.min.js'}, expect.any(Function));
    //     expect(chrome.tabs.executeScript).toHaveBeenNthCalledWith(2,tabId, {file: process.env.PUBLIC_URL + '/contentScript.js'}, expect.any(Function));
    //     expect(callback).toHaveBeenCalledTimes(1);
    //     expect(callback).toHaveBeenCalledWith(null);
    //   })
    // })
    
    // describe('second call', () => {
    //   test('sends message to content script', () => {
    //     chrome.runtime.lastError = false;
      
    //     tools.sendToContent(tabId, obj, callback);
        
    //     expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(1);
    //     expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, obj, {frameId: 0}, expect.any(Function));
    //     expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(0);
    //     expect(callback).toHaveBeenCalledTimes(1);
    //     expect(callback).toHaveBeenCalledWith(null);
    //   })
    // })

    // describe('opera allow search page results setting', () => {
    //   test('it fires callback with correct error message when setting is disabled', () => {
    //     let injectionError;
    //     let response = {recieved: "yes", frameCheck: false};
    //     chrome.tabs.sendMessage = jest.fn((tab_id, obj, frameId, _callback) => {
    //       _callback(injectionError, response)
    //     });
    //     chrome.tabs.executeScript = jest.fn((tab_id, object, _callback) => {
    //       injectionError = {message: 'This page cannot be scripted due to an ExtensionsSettings policy.'};
    //     })

    //     tools.sendToContent(tabId, obj, callback);

    //     expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(1);
    //     expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, obj, {frameId: 0}, expect.any(Function));
    //     expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
    //     expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: process.env.PUBLIC_URL + 'jquery-3.5.1.slim.min.js'}, expect.any(Function));
    //     expect(callback).toHaveBeenCalledTimes(1);
    //     expect(callback).toHaveBeenCalledWith(tools.operaErrors.popupWarning, response)
    //   })
    // })
  })
})
