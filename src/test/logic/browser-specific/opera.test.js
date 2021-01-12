import opera from "../../../logic/browser-specific/opera";

const mockTab = {url: 'google.com', id: 1};

describe('opera', () => {
  describe('isOpera', () => {
    let userAgentGetter;
    
    beforeEach(() => {
      // navigator object cannot be directly modified so we mock it here
      userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
    })

    test('it returns a truthy string when navigator.userAgent contains the word "Opera" or the string "OPR"', () => {
      userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36 OPR/70.0.3728.154')

      const result = opera.isOpera();

      expect(result).toBeTruthy();
    })

    test('it returns null when navigator.userAgent does not contain the word "Opera" or the string "OPR"', () => {
      userAgentGetter.mockReturnValue('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0');

      const result = opera.isOpera();

      expect(result).toBeFalsy();
    })
  })

  describe('urlInvalid', () => {
    test('a valid url should return string "valid URL"', () => {
      const result = opera.urlInvalid(mockTab)
  
      expect(result).toBeFalsy();
    })
  
    test('a opera addons url should return addons error text', () => {
      const tab = {url: 'https://addons.opera.com'}
      
      const result = opera.urlInvalid(tab)
  
      expect(result).toEqual(opera.addonsErrorString);
    })
  })
})