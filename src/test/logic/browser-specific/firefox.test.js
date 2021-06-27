import firefox from "../../../logic/browser-specific/firefox"

const mockTab = {url: 'google.com', id: 1};
global.browser = {runtime: {}};

describe('firefox', () => {
  describe('isFirefox', () => {
    test('it returns true when the getBrowserInfo function exists', () => {
      global.browser = {
        runtime: {
          getBrowserInfo: jest.fn()
        }
      }

      const result = firefox.isFirefox();

      expect(result).toBeTruthy();
      global.browser = undefined;
    })

    test('it returns false when the getBrowserInfo function does not exist', () => {
      const result = firefox.isFirefox();

      expect(result).toBeFalsy();
    })
  })

  describe('urlInvalid', () => {
    test('a valid url should return string valid=true', () => {
      const expected = {message: '', valid: true}
      
      const result = firefox.urlValid(mockTab)
  
      expect(result).toEqual(expected);
    })
  
    test('an addons url should return addons error text', () => {
      const tab = {url: 'https://addons.mozilla.org/en-US/firefox/'}
      const expected = {message: firefox.addonsErrorString, valid: false}
      
      const result = firefox.urlValid(tab)
  
      expect(result).toEqual(expected);
    })
  })
})