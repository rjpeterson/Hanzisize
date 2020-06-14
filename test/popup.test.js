const { assert, expect } = require('chai');
const pupp = require('./testBoot');

const getElementText = async (el) => {
  const elText = await pupp.extensionPage.$eval(`${el}`, e => e.innerText);
  return elText;
}
const getElementValue = async (el) => {
  const elText = await pupp.extensionPage.$eval(`${el}`, e => e.value);
  return elText;
}

describe('Extension popup', function() {
  this.timeout(20000); // default is 2 seconds and that may not be enough to boot browsers and pages.

  before(async function() {
    await pupp.launchBrowser();
    await pupp.extensionPage.bringToFront();
  });
  after(async function() {
    await pupp.browser.close();
  });

  describe('popup content', () => {
    it('displays a number input box', async () => {
      const inputElement = await pupp.extensionPage.$('#min-font-size');
      assert.ok(inputElement, 'Input field does not exist');
    })

    it('displays a submit button', async () => {
      const submitButton = await pupp.extensionPage.$('#submit');
      assert.ok(submitButton, 'Submit button does not exist')
    })

    it('displays the current saved font size element', async() => {
      const currentFontSize = await pupp.extensionPage.$('#curr-saved-font-size');
      assert.ok(currentFontSize, 'curr-saved-font-size element does not exist')
    })
  });

  describe('submit button action', () => {
    describe('chrome storage changes', () => {
      it('stores and retrieves a number value from chrome storage', async () => {
        const expected = '15';
        const input = await pupp.extensionPage.$('#min-font-size');
        const submit = await pupp.extensionPage.$('#submit');
  
        
        await input.type(expected);
        console.log(`input field content: ${await getElementValue('#min-font-size')}`)
        await submit.click();
        await pupp.extensionPage.waitFor(20);
  
        const actual = await getElementText('#curr-saved-font-size');
        console.log(`retrieved font size: ${actual}`);
        const errorMessage = await getElementText('#error-message');
        console.log(`error message :${errorMessage}`);
        assert.equal(actual, expected);
        assert.equal(errorMessage, '')
      })
  
      it('errors and doesnt change chrome storage when given a negative number', async () => {
        const fontSize = '-4';
        const savedFontSize = await getElementText('#curr-saved-font-size');
        const input = await pupp.extensionPage.$('#min-font-size');
        const submit = await pupp.extensionPage.$('#submit');
        const expectedError = 'Font Size must be a positive number';
  
        await input.type(fontSize);
        await submit.click();
        
        const returnedFontSize = await getElementText('#curr-saved-font-size');
        const errorMessage = await getElementText('#error-message');
  
        expect(returnedFontSize, 'Returned Font Size').to.equal(savedFontSize);
        expect(errorMessage, '#error-message text').to.equal(expectedError)
      })
    })
  })
});
