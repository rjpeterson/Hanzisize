import onAppMount from "../../logic/onAppMount";

jest.mock('../../logic/chromeTools', () => ({
  getFromStorage: jest.fn().mockReturnValue(12)
}))

const mockTab = {url: 'google.com', id: 1};
global.chrome = {
  tabs: {
    query: jest.fn((obj, callback) => {callback([mockTab])})
  }
}

describe('onAppMount', () => {
  describe('userBrowser', () => {
    test('it correctly identifies Firefox', () => {
      const expected = 'firefox';
      global.browser = {
        runtime: {
          getBrowserInfo: jest.fn()
        }
      }

      const result = onAppMount.userBrowser();

      expect(result).toEqual(expected);
      global.browser = undefined;
    })

    test('it correctly identifies Chrome', () => {
      const expected = 'chrome';
      onAppMount.browserChrome.chromeInfo = jest.fn().mockReturnValue(true)

      const result = onAppMount.userBrowser();

      expect(onAppMount.browserChrome.chromeInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it correctly identifies Opera', () => {
      const expected = 'opera';
      onAppMount.browserOpera.operaInfo = jest.fn().mockReturnValue(true)

      const result = onAppMount.userBrowser();

      expect(onAppMount.browserOpera.operaInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })
  })

  describe('urlChecking', () => {
    test('it calls firefox urlchecking if userBrowser returns firefox', () => {
      onAppMount.userBrowser = jest.fn().mockReturnValue('firefox');
      onAppMount.browserFirefox.urlChecking = jest.fn().mockReturnValue(true);

      const result = onAppMount.urlChecking(mockTab)

      expect(result).toBeTruthy;
      expect(onAppMount.userBrowser).toHaveBeenCalledTimes(1);
      expect(onAppMount.browserFirefox.urlChecking).toHaveBeenCalledTimes(1);
    })

    test('it calls chrome urlchecking if userBrowser returns chrome', () => {
      onAppMount.userBrowser = jest.fn().mockReturnValue('chrome');
      onAppMount.browserChrome.urlChecking = jest.fn().mockReturnValue(true);

      const result = onAppMount.urlChecking(mockTab)

      expect(result).toBeTruthy;
      expect(onAppMount.userBrowser).toHaveBeenCalledTimes(1);
      expect(onAppMount.browserChrome.urlChecking).toHaveBeenCalledTimes(1);
    })

    test('it calls opera urlchecking if userBrowser returns opera', () => {
      onAppMount.userBrowser = jest.fn().mockReturnValue('opera');
      onAppMount.browserOpera.urlChecking = jest.fn().mockReturnValue(true);

      const result = onAppMount.urlChecking(mockTab)

      expect(result).toBeTruthy;
      expect(onAppMount.userBrowser).toHaveBeenCalledTimes(1);
      expect(onAppMount.browserOpera.urlChecking).toHaveBeenCalledTimes(1);
    })
  })
  
  describe('main', () => {
    const mockCallback = jest.fn();
    const mockUrlvaliditiyMessage = 'valid';
  
    test('queries chrome api for tab info, gets url validity string and passes it to a callback', () => {
      onAppMount.urlChecking = jest.fn().mockReturnValue(mockUrlvaliditiyMessage);

      onAppMount.main(mockCallback);
  
      expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true }, expect.any(Function))
      expect(onAppMount.urlChecking).toHaveBeenCalledTimes(1);
      expect(onAppMount.urlChecking).toHaveBeenCalledWith(mockTab);
      expect(mockCallback).toHaveBeenCalledWith(mockTab.id, mockUrlvaliditiyMessage)
    })
  })
})