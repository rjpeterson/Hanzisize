import onAppMount from "../../logic/onAppMount";
jest.mock('../../logic/chromeTools', () => ({
  getFromStorage: jest.fn().mockReturnValue(12)
}))
const mockTab = {url: 'google.com', id: 1};
global.chrome = {
  tabs: {
    query: jest.fn((obj, callback) => {
      callback([mockTab])
    })
  }
}

describe('onAppMount', () => {
  describe('browserFirefox', () => {
    describe('urlChecking', () => {
      test('a valid url should return string "valid URL"', () => {
        const tab = {url: 'www.google.com'}
    
        const result = onAppMount.browserFirefox.urlChecking(tab)
    
        expect(result).toEqual('valid URL');
      })
    
      test('an addons url should return appropriate error text', () => {
        const tab = {url: 'https://addons.mozilla.org/en-US/firefox/'}
        
        const result = onAppMount.browserFirefox.urlChecking(tab)
    
        expect(result).toEqual(onAppMount.browserFirefox.addonsErrorString);
      })
    })
  })

  describe('browserChrome', () => {
    describe('chromeInfo', () => {
      let userAgentGetter;
      
      beforeEach(() => {
        userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
      })

      test('it returns a value when navigator.userAgent contains the word "Chrome"', () => {
        userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36 OPR/70.0.3728.154')

        const result = onAppMount.browserChrome.chromeInfo();

        expect(result).toBeTruthy();
      })

      test('it returns null when navigator.userAgent does not contain the word "Chrome"', () => {
        userAgentGetter.mockReturnValue('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0');

        const result = onAppMount.browserChrome.chromeInfo();

        expect(result).toBeFalsy();
      })
    })

    describe('urlChecking', () => {
      test('a valid url should return string "valid URL"', () => {
        const tab = {url: 'www.google.com'}
    
        const result = onAppMount.browserChrome.urlChecking(tab)
    
        expect(result).toEqual('valid URL');
      })
    
      test('a webstore url should return matching error text', () => {
        const tab = {url: 'https://chrome.google.com/webstore/category/extensions'}
        
        const result = onAppMount.browserChrome.urlChecking(tab)
    
        expect(result).toEqual(onAppMount.browserChrome.webstoreErrorString);
      })
    })
  })

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
  })

  describe('urlChecking', () => {
    test('it calls firefox urlchecking if userBrowser returns firefox', () => {
      const tab = {};
      onAppMount.userBrowser = jest.fn().mockReturnValue('firefox');
      onAppMount.browserFirefox.urlChecking = jest.fn().mockReturnValue(true);

      const result = onAppMount.urlChecking(tab)

      expect(result).toBeTruthy;
      expect(onAppMount.userBrowser).toHaveBeenCalledTimes(1);
      expect(onAppMount.browserFirefox.urlChecking).toHaveBeenCalledTimes(1);
    })
    
    test('it calls chrome urlchecking if userBrowser returns chrome', () => {
      const tab = {};
      onAppMount.userBrowser = jest.fn().mockReturnValue('chrome');
      onAppMount.browserChrome.urlChecking = jest.fn().mockReturnValue(true);

      const result = onAppMount.urlChecking(tab)

      expect(result).toBeTruthy;
      expect(onAppMount.userBrowser).toHaveBeenCalledTimes(1);
      expect(onAppMount.browserChrome.urlChecking).toHaveBeenCalledTimes(1);
    })
  })
  
  describe('main', () => {
    const mockCallback = jest.fn();
    const mockUrlvaliditiyMessage = 'valid';
  
    test('queries chrome for tab info, gets url validity string and passes it to a callback', () => {
      onAppMount.urlChecking = jest.fn().mockReturnValue(mockUrlvaliditiyMessage);

      onAppMount.main(mockCallback);
  
      expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, lastFocusedWindow: true }, expect.any(Function))
      expect(onAppMount.urlChecking).toHaveBeenCalledTimes(1);
      expect(onAppMount.urlChecking).toHaveBeenCalledWith(mockTab);
      expect(mockCallback).toHaveBeenCalledWith(mockTab.id, mockUrlvaliditiyMessage)
    })
  })
})