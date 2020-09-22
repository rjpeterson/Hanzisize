import firefox from "../../../logic/browser-specific/firefox"

const mockTab = {url: 'google.com', id: 1};

describe('browserFirefox', () => {
  describe('urlChecking', () => {
    test('a valid url should return string "valid URL"', () => {    
      const result = firefox.urlChecking(mockTab)
  
      expect(result).toEqual('valid URL');
    })
  
    test('an addons url should return addons error text', () => {
      const tab = {url: 'https://addons.mozilla.org/en-US/firefox/'}
      
      const result = firefox.urlChecking(tab)
  
      expect(result).toEqual(firefox.addonsErrorString);
    })
  })
})