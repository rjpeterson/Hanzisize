import { FilterFramesOutlined } from '@material-ui/icons';
import tools from '../../logic/chromeTools';

const mockStoredObject = {'minFontSize': 10, 'language': 'chinese'};

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
  
      tools.handleFirstMessageResponse(chrome.runtime.lastError, response, tabId, obj);

      expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: process.env.PUBLIC_URL + 'jquery-3.5.1.slim.min.js'}, expect.any(Function));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(false, tabId, obj);
    })

    test('sets response variable if message recieved', () => {
      chrome.runtime.lastError = false;
      response = true;

      tools.handleFirstMessageResponse(chrome.runtime.lastError, response, tabId, obj);

      expect(tools.contentResponse).toEqual(response);
    })
  })

  describe('handleJqueryInjection', () => {
    const tabId = 1;
    const obj = {mock: 'obj'};

    test('it passes errors to the error handler', () => {
      chrome.runtime.lastError = true;
      const spy = jest.spyOn(tools, "handleJqueryInjectErr").mockReturnValueOnce(true);

      tools.handleJqueryInjection(chrome.runtime.lastError, tabId, obj);

      expect(spy).toHaveBeenCalledWith(chrome.runtime.lastError);
      expect(tools.injectionError).toBeTruthy();
    })

    test('if there is no error, it injects content script', () => {
      chrome.runtime.lastError = false;
      const spy = jest.spyOn(tools, "injectContentScript").mockReturnValueOnce(true);

      tools.handleJqueryInjection(chrome.runtime.lastError, tabId, obj);

      expect(spy).toHaveBeenCalledWith(tabId, obj);
    })
  })

  describe('handleJqueryInjectErr', () => {
    test('it tests for Opera Settings',() => {
      const testErr = tools.operaErrors.extensionSettings;

      tools.handleJqueryInjectErr(testErr);

      expect(tools.injectionError).toEqual(tools.operaErrors.popupWarning);
    })

    test('it tests for Opera Settings',() => {
      const testErr = 'mock error';

      tools.handleJqueryInjectErr(testErr);

      expect(tools.injectionError).toEqual(testErr);
    })
  })

  describe('injectContentScript', () => {
    const tabId = 1;
    const obj = {mock: 'obj'};

    test('script fails to inject and returns correct injection error', () => {
      chrome.tabs.executeScript = jest.fn((tab_id, object, _callback) => {
        _callback();
      })

      tools.injectContentScript(tabId, obj);

      expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: process.env.PUBLIC_URL + '/contentScript.js'}, expect.any(Function))
      expect(tools.injectionError).toEqual(chrome.runtime.lastError.message)
    })

    test('script successfully injects', () => {
      const spy = jest.spyOn(tools, 'secondMessageToScripts');

      tools.injectContentScript(tabId, obj);
      expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tabId, {file: process.env.PUBLIC_URL + '/contentScript.js'}, expect.any(Function))
      expect(spy).toHaveBeenCalledWith(tabId, obj)
    })
  })
  
  describe('secondMessageToScripts', () => {
    const tabId = 1;
    const obj = {mock: 'obj'};

    test('it sends the message to the content script', () => {
      tools.secondMessageToScripts(tabId, obj);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, obj, {frameId: 0}, expect.any(Function));
      expect(tools.contentResponse).toEqual('message response')
    })
  });

  describe('sendToContent', () => {
    const tabId = 1;
    const obj = {mock: 'object'};
    const callback = jest.fn();

    test('it send the object to the tab and passes any response to the handler function', () => {
      const spy = jest.spyOn(tools, 'handleFirstMessageResponse');

      tools.sendToContent(tabId, obj, callback);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, obj, {frameId: 0}, expect.any(Function));
      expect(spy).toHaveBeenCalledWith(chrome.runtime.lastError, 'message response', tabId, obj);
      expect(callback).toHaveBeenCalledWith(tools.injectionError, tools.contentResponse);
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
