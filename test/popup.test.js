const { assert, expect } = require('chai');
const pupBrowser = require('./testBoot');

const getElementText = async (el) => {
  const elText = await pupBrowser.extensionPage.$eval(`${el}`, e => e.innerText);
  return elText;
}

describe('Extension popup', function() {
  this.timeout(20000); // default is 2 seconds and that may not be enough to boot browsers and pages.

  before(async function() {
    await pupBrowser.launchBrowser();
  });
  after(async function() {
    await pupBrowser.browser.close();
  });

  describe('popup content', () => {
    it('displays a number input box', async () => {
      const inputElement = await pupBrowser.extensionPage.$('#min-font-size');
      assert.ok(inputElement, 'Input field does not exist');
    })

    it('displays a submit button', async () => {
      const submitButton = await pupBrowser.extensionPage.$('#submit');
      assert.ok(submitButton, 'Submit button does not exist')
    })

    it('displays the current saved font size', async() => {
      const currentFontSize = await pupBrowser.extensionPage.$('#curr-saved-font-size');
      assert.ok(currentFontSize, 'curr-saved-font-size element does not exist')
    })
  });

  describe('submit button action', () => {
    it('stores and retrieves a number value from chrome storage', async () => {
      const expected = '15';
      const input = await pupBrowser.extensionPage.$('#min-font-size');
      const submit = await pupBrowser.extensionPage.$('#submit');

      try {
        await input.type(expected);
        if (await getElementText('#min-font-size') != '15') throw "input failed";
      }
      catch(err) {console.log(err)};
      await submit.click();

      const actual = await getElementText('#curr-saved-font-size');
      const errorMessage = await getElementText('#error-message');
      assert.equal(actual, expected);
      assert.equal(errorMessage, '')
    })

    it('throws an error when given a negative number', async () => {
      const fontSize = '-4';
      const savedFontSize = await getElementText('#curr-saved-font-size');
      const input = await pupBrowser.extensionPage.$('#min-font-size');
      const submit = await pupBrowser.extensionPage.$('#submit');
      const expectedError = 'Font Size must be a positive number';

      await input.type(fontSize);
      await submit.click();
      const returnedFontSize = await getElementText('#curr-saved-font-size');
      const errorMessage = await getElementText('#error-message');

      expect(returnedFontSize, 'Returned Font Size').to.equal(savedFontSize);
      expect(errorMessage, '#error-message text').to.equal(expectedError)
    })
  })
});

