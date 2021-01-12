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
      const expected = 'firefox'
      const spy = jest.spyOn(firefox, 'isFirefox');
      spy.mockReturnValue(true);

      const result = onAppMount.userBrowser();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it correctly identifies Chrome', () => {
      const expected = 'chrome';
      const spy = jest.spyOn(googlechrome, 'isChrome');
      spy.mockReturnValue(true);

      const result = onAppMount.userBrowser();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it correctly identifies Opera', () => {
      const expected = 'opera';
      const spy = jest.spyOn(opera, 'isOpera');
      spy.mockReturnValue(true);

      const result = onAppMount.userBrowser();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })

    test('it correctly identifies Edge', () => {
      const expected = 'edge';
      const spy = jest.spyOn(edge, 'isEdge');
      spy.mockReturnValue(true);

      const result = onAppMount.userBrowser();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    })
  })

  describe('urlInvalid', () => {
    test('it calls firefox urlchecking if passed firefox', () => {
      firefox.urlInvalid = jest.fn().mockReturnValue(true);

      const result = onAppMount.urlInvalid(mockTab, 'firefox');

      expect(result).toBeTruthy;

      expect(firefox.urlInvalid).toHaveBeenCalledTimes(1);
    })

    test('it calls chrome urlchecking if passed firefox', () => {
      googlechrome.urlInvalid = jest.fn().mockReturnValue(true);

      const result = onAppMount.urlInvalid(mockTab, 'chrome')

      expect(result).toBeTruthy;
      expect(googlechrome.urlInvalid).toHaveBeenCalledTimes(1);
    })

    test('it calls opera urlchecking if passed opera', () => {
      opera.urlInvalid = jest.fn().mockReturnValue(true);

      const result = onAppMount.urlInvalid(mockTab, 'opera')

      expect(result).toBeTruthy;
      expect(opera.urlInvalid).toHaveBeenCalledTimes(1);
    })

    test('it calls edge urlchecking if passed edge', () => {
      edge.urlInvalid = jest.fn().mockReturnValue(true);

      const result = onAppMount.urlInvalid(mockTab, 'edge')

      expect(result).toBeTruthy;
      expect(edge.urlInvalid).toHaveBeenCalledTimes(1);
    })
  })
  
  describe('main', () => {
    const mockUrlvaliditiyMessage = 'valid';
    const mockBrowser = 'chrome'
  
    test('queries chrome api for tab info, gets url validity string and passes it to a callback', async () => {
      const spyUI = jest.spyOn(onAppMount, 'urlInvalid'); 
      const spyUB = jest.spyOn(onAppMount, 'userBrowser'); 
      spyUI.mockReturnValue(mockUrlvaliditiyMessage);
      spyUB.mockReturnValue(mockBrowser);

      const result = await onAppMount.main();
  
      expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true }, expect.any(Function))
      expect(spyUB).toHaveBeenCalledTimes(1);
      expect(spyUI).toHaveBeenCalledTimes(1);
      expect(spyUI).toHaveBeenCalledWith(mockTab, mockBrowser);
      expect(result).toStrictEqual({
        tabId: mockTab.id, 
        validBrowser: mockBrowser,
        invalidUrl: 'valid'
      })
    })
  })
})