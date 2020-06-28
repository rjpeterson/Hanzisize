import tools from '../../logic/chromeTools';

global.chrome = {
  runtime: {
    lastError: true
  },
  storage: {
    local: {
      set: jest.fn().mockReturnValue(10),
      get: jest.fn().mockReturnValue(10)
    }
  },
  tabs: {
    sendMessage: jest.fn((tab_id, arg2, arg3, arg4) => {
      if(chrome.runtime.lastError) {
        chrome.tabs.executeScript(tab_id, {
          file: process.env.PUBLIC_URL + '/contentScript.js'
        }, () => {
          tools.sendToContent(tab_id, arg2);
        })
      } else {
        return undefined
      }
    }),
    executeScript: jest.fn((tab_id, object, callback) => {
      chrome.runtime.lastError = false;
      callback();
    })
  }
}

beforeEach(() => {
  chrome.runtime.lastError = true;
})

test('pushToStorage', () => {
  const inputArg = 10;
  tools.pushToStorage(inputArg);
  expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    minFontSize: inputArg
  }, expect.any(Function))
})

test('getFromStorage', async () => {
  const output = await tools.getFromStorage();
  expect(chrome.storage.local.get).toHaveBeenCalledTimes(1);
  expect(output).toEqual(10)
})

test('sentToContent initial call', () => {
  const tab_id = 1;
  const obj = {key: 'val'};

  tools.sendToContent(tab_id, obj);

  expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2);
  expect(chrome.tabs.sendMessage).toHaveBeenNthCalledWith(1, tab_id, obj, {frameId: 0}, expect.any(Function))
  expect(chrome.tabs.sendMessage).toHaveBeenNthCalledWith(2, tab_id, obj, {frameId: 0}, expect.any(Function))
  // expect(chrome.tabs.sendMessage.mock.calls[0]).toEqual([tab_id, obj, {frameId: 0}, expect.any(Function)]);
  // expect(chrome.tabs.sendMessage.mock.calls[1]).toEqual([tab_id, obj, {frameId: 0}, expect.any(Function)]);
  expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(1);
  expect(chrome.tabs.executeScript).toHaveBeenCalledWith(tab_id, {file: process.env.PUBLIC_URL + '/contentScript.js'}, expect.any(Function))

})

test('sentToContent second call', () => {
  const tab_id = 1;
  const obj = {key: 'val'};
  chrome.runtime.lastError = false;

  tools.sendToContent(tab_id, obj);
  
  expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(1);
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tab_id, obj, {frameId: 0}, expect.any(Function));
  expect(chrome.tabs.executeScript).toHaveBeenCalledTimes(0);
})