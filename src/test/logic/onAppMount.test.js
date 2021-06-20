import onAppMount from "../../logic/onAppMount";
import googlechrome from '../../logic/browser-specific/googlechrome';
import firefox from '../../logic/browser-specific/firefox';
import opera from '../../logic/browser-specific/opera';
import edge from '../../logic/browser-specific/edge';

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
      const expected = {message: 'firefox', valid: true};
      const spy = jest.spyOn(firefox, 'isFirefox');
      spy.mockReturnValue(true);

      const result = onAppMount.userBrowser();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it correctly identifies Chrome', () => {
      const expected = {message: 'chrome', valid: true};
      const spy = jest.spyOn(googlechrome, 'isChrome');
      spy.mockReturnValue(true);

      const result = onAppMount.userBrowser();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it correctly identifies Opera', () => {
      const expected = {message: 'opera', valid: true};
      const spy = jest.spyOn(opera, 'isOpera');
      spy.mockReturnValue(true);

      const result = onAppMount.userBrowser();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it correctly identifies Edge', () => {
      const expected = {message: 'edge', valid: true};
      const spy = jest.spyOn(edge, 'isEdge');
      spy.mockReturnValue(true);

      const result = onAppMount.userBrowser();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })
  })

  describe('urlInvalid', () => {
    const urlValidMockReturn = {message: '', valid: true};

    test('it calls firefox urlchecking if passed firefox', () => {
      const expected = urlValidMockReturn;
      firefox.urlValid = jest.fn().mockReturnValue(urlValidMockReturn);

      const result = onAppMount.urlValid(mockTab, 'firefox');

      expect(result).toEqual(expected);
      expect(firefox.urlValid).toHaveBeenCalledTimes(1);
    })

    test('it calls chrome urlchecking if passed firefox', () => {
      const expected = urlValidMockReturn;
      googlechrome.urlValid = jest.fn().mockReturnValue(urlValidMockReturn);

      const result = onAppMount.urlValid(mockTab, 'chrome')
      

      expect(result).toEqual(expected);
      expect(googlechrome.urlValid).toHaveBeenCalledTimes(1);
    })

    test('it calls opera urlchecking if passed opera', () => {
      const expected = urlValidMockReturn
      opera.urlValid = jest.fn().mockReturnValue(urlValidMockReturn);

      const result = onAppMount.urlValid(mockTab, 'opera')

      expect(result).toEqual(expected);
      expect(opera.urlValid).toHaveBeenCalledTimes(1);
    })

    test('it calls edge urlchecking if passed edge', () => {
      const expected = urlValidMockReturn
      edge.urlValid = jest.fn().mockReturnValue(urlValidMockReturn);

      const result = onAppMount.urlValid(mockTab, 'edge')
      
      expect(result).toEqual(expected);
      expect(edge.urlValid).toHaveBeenCalledTimes(1);
    })
  })
  
  describe('main', () => {
    const mockUrlValidResult = {
      valid: true,
      message: ''
    };
    const mockUserBrowserResult = {
      valid: true,
      message: 'chrome'
    }
  
    test('queries chrome api for tab info, gets url validity string and passes it to a callback', async () => {
      const expected = {
        tabId: mockTab.id, 
        browserValid: mockUserBrowserResult,
        urlValid: mockUrlValidResult
      }
      const spyUV = jest.spyOn(onAppMount, 'urlValid'); 
      const spyUB = jest.spyOn(onAppMount, 'userBrowser'); 
      spyUV.mockReturnValue(mockUrlValidResult);
      spyUB.mockReturnValue(mockUserBrowserResult);

      const result = await onAppMount.main();
      
      expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true }, expect.any(Function))
      expect(spyUB).toHaveBeenCalledTimes(1);
      expect(spyUV).toHaveBeenCalledTimes(1);
      expect(spyUV).toHaveBeenCalledWith(mockTab, mockUserBrowserResult.message);
      expect(result).toStrictEqual(expected)
    })
  })
})