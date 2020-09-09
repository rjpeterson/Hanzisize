import tools from '../../logic/chromeTools';

describe('chromeTools', () => {
  beforeEach(() => {
    global.chrome = {
      runtime: {
        lastError: true
      },
      storage: {
        local: {
          set: jest.fn().mockReturnValue(10),
          get: jest.fn((array, _callback) => {_callback({'minFotnSize': 10, 'language': 'chinese'})})
        }
      },
      tabs: {
        sendMessage: jest.fn((tab_id, obj, frameObj, callback) => {
          if (chrome.runtime.lastError) {
            callback(false);
          } else {
            callback(true)
          }
        }),
        executeScript: jest.fn((tab_id, object, callback) => {
          chrome.runtime.lastError = false;
          callback();
        })
      }
    }
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
    const GFSCallback = jest.fn((arr) => {return arr});

    test('calls callback on minFontSize and Language object from chrome storage', () => {
      const result = tools.getFromStorage(GFSCallback);
      expect(chrome.storage.local.get).toHaveBeenCalledTimes(1);
      expect(GFSCallback).toHaveBeenCalledWith({'minFotnSize': 10, 'language': 'chinese'});
    })
  })
  
  describe('sendToContent', () => {
    const tab_id = 1;
    const obj = {key: 'val'};
    const callback = jest.fn();

    beforeEach(() => {
      chrome.runtime.lastError = true;
    })

    describe('initial call', () => {
      test('sends message, fails, injects content script and sends message again', () => {
      
        tools.sendToContent(tab_id, obj, callback);
      
        expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2);
        expect(chrome.tabs.sendMessage).toHaveBeenNthCalledWith(1, tab_id, obj, {frameId: 0}, expect.any(Function))
        expect(chrome.tabs.sendMessage).toHaveBeenNthCalledWith(2, tab_id, obj, {frameId: 0}, expect.any(Function))
        expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(2);
        expect(chrome.tabs.executeScript).toHaveBeenNthCalledWith(1,tab_id, {file: process.env.PUBLIC_URL + 'jquery-3.5.1.slim.min.js'}, expect.any(Function));
        expect(chrome.tabs.executeScript).toHaveBeenNthCalledWith(2,tab_id, {file: process.env.PUBLIC_URL + '/contentScript.js'}, expect.any(Function));
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(null);
      })
    })
    
    describe('second call', () => {
      test('sends message to content script', () => {
        chrome.runtime.lastError = false;
      
        tools.sendToContent(tab_id, obj, callback);
        
        expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(1);
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tab_id, obj, {frameId: 0}, expect.any(Function));
        expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(0);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(null);
      })
    })

    describe('opera allow search page results setting', () => {
      test('it fires callback with correct error message when setting is disabled', () => {
        global.chrome.tabs.executeScript = jest.fn((tab_id, object, callback) => {
          chrome.runtime.lastError = {message: 'This page cannot be scripted due to an ExtensionsSettings policy.'};
          callback();
        })

        tools.sendToContent(tab_id, obj, callback);

        expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(1);
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tab_id, obj, {frameId: 0}, expect.any(Function));
        expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
        expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tab_id, {file: process.env.PUBLIC_URL + 'jquery-3.5.1.slim.min.js'}, expect.any(Function));
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(tools.operaErrors.popupWarning)
      })
    })
  })
})
