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
  describe('urlChecking', () => {
    test('a valid url should return string "valid URL"', () => {
      const tab = {url: 'www.google.com'}
  
      const result = onAppMount.urlChecking(tab)
  
      expect(result).toEqual('valid URL');
    })
  
    test('a webstore url should return matching error text', () => {
      const tab = {url: 'https://chrome.google.com/webstore/category/extensions'}
      
      const result = onAppMount.urlChecking(tab)
  
      expect(result).toEqual(onAppMount.webstoreErrorString);
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