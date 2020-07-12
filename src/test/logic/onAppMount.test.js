import onAppMount from "../../logic/onAppMount";
import tools from "../../logic/chromeTools";
jest.mock('../../logic/chromeTools', () => ({
  getFromStorage: jest.fn().mockReturnValue(12)
}))

global.chrome = {
  tabs: {
    query: jest.fn((obj, callback) => {
      callback([{url: 'google.com', id: 1}])
    })
  }
}

describe('urlChecking', () => {
  let spy;
  let mockElement;
  beforeAll(() => {
    spy = jest.spyOn(document, 'getElementById');
    mockElement = document.createElement('error-content');
    spy.mockReturnValue(mockElement);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  })

  test('it should accept a valid url', () => {
    const tab = {
      url: 'www.google.com'
    }

    const result = onAppMount.urlChecking(tab)

    expect(document.getElementById).toHaveBeenCalledTimes(0);
    expect(mockElement.innerHTML).toEqual('');
    expect(result).toEqual('valid URL');
  })

  test('it should reject an invalid url', () => {
    const tab = {
      url: 'https://chrome.google.com/webstore/category/extensions'
    }
    
    const result = onAppMount.urlChecking(tab)

    expect(document.getElementById).toHaveBeenCalledTimes(1);
    expect(mockElement.innerHTML).toEqual(onAppMount.webstoreErrorString);
    expect(result).toEqual('invalid URL');
  })
})

describe('helper', () => {
  const URLC = onAppMount.urlChecking;

  beforeAll(() => {
    onAppMount.urlChecking = jest.fn()
  });

  afterAll(() => {
    onAppMount.urlChecking = URLC;
  })

  test('it accepts a tabs object and returns a response object', async () => {
    const tabs = [{url: 'google.com', id: 1}];

    const responseObject = await onAppMount.helper(tabs);

    expect(onAppMount.urlChecking).toHaveBeenCalledTimes(1);
    expect(onAppMount.urlChecking).toHaveBeenCalledWith(tabs[0]);
    expect(tools.getFromStorage).toHaveBeenCalledTimes(1);
    expect(responseObject).toEqual({tabId: 1, minFontSize: 12})
  })

  // describe('it throws error on receiving invalid tabs object' , () => {
  //   test('no id property', () => {
  //   const tabs = [{data: 'abcde', url: 'www.google.com'}];

  //   expect(async () => {await onAppMount.helper(tabs)}).toThrow()
  //   })

  //   test('no url property', () => {
  //   const tabs = [{data: 'abcde', id: 15}];

  //   expect(async () => {await onAppMount.helper(tabs)}).toThrow()
  //   })
  // })
})

describe.only('main', () => {
  const responseObject = {tabId: 1, minFontSize: 12};
  const helper = onAppMount.helper;
  onAppMount.helper = jest.fn().mockReturnValue(responseObject);
  const mockCallback = jest.fn();

  afterAll(() => {
    onAppMount.helper = helper;
  })

  test('queries chrome for tab info and passes it to a callback', () => {
    onAppMount.main();

    expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, lastFocusedWindow: true }, expect.any(Function))
    expect(onAppMount.helper).toHaveBeenCalledTimes(1);

  })
})