import edge from "../../../logic/browser-specific/edge";

const mockTab = {url: 'google.com', id: 1};

describe('edge', () => {
  describe('isEdge', () => {
    let userAgentGetter;
    
    beforeEach(() => {
      // navigator object cannot be directly modified so we mock it here
      userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
    })

    test('it returns a truthy string when navigator.userAgent contains the string "Edg"', () => {
      userAgentGetter.mockReturnValue("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43")

      const result = edge.isEdge();

      expect(result).toBeTruthy();
    })

    test('it returns null when navigator.userAgent does not contain the string "Edg"', () => {
      userAgentGetter.mockReturnValue('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0');

      const result = edge.isEdge();

      expect(result).toBeFalsy();
    })
  })

  describe('urlInvalid', () => {
    test('a valid url should return string valid=true', () => {
      const expected = {message: '', valid: true}
      
      const result = edge.urlValid(mockTab)
  
      expect(result).toEqual(expected);
    })
  
    test('a edge addons url should return addons error text', () => {
      const tab = {url: 'https://microsoftedge.microsoft.com/addons'}
      const expected = {message: edge.addonsErrorString, valid: false}
      
      const result = edge.urlValid(tab)
  
      expect(result).toEqual(expected);
    })
  })
})