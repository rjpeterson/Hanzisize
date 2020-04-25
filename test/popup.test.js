const { assert } = require('chai');
const pupBrowser = require('./testBoot');

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
      const currentFontSize = await pupBrowser.extensionPage.$('#currSavedFontSize');
      assert.ok(currentFontSize, 'Current-saved-font-size does not exist')
    })
  });

  describe('submit button', () => {
    it('stores and retrieves a number value from chrome storage', async () => {
      const expected = '15';
      const input = await pupBrowser.extensionPage.$('#min-font-size');
      const submit = await pupBrowser.extensionPage.$('#submit');

      await input.type(expected);
      await submit.click;

      const actual = await pupBrowser.extensionPage.$eval('#currSavedFontSize', e => e.innerText);
      assert.equal(actual, expected);
    })
  })
});

