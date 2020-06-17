const { assert, expect } = require('chai');
const util = require('../contentScript');
const pupp = require('./testBoot');
let page;

const getElementText = async (el) => {
  const elText = await page.$eval(`${el}`, e => e.innerText);
  return elText;
}
const getElementValue = async (el) => {
  const elText = await page.$eval(`${el}`, e => e.value);
  return elText;
}

const getAttributeValue = async (elementId, attribute) => {
  const attrValue = await page.evaluate(() => {
    const el = document.getElementById(elementId);
    return window.getComputedStyle(el).getPropertyValue(attribute)
  })
  return attrValue;
}

const removeAttributeValue = async (elID, attribute) => {
  await page.evaluate(() => {
    const el = document.getElementById(`${elID}`);
    el.removeAttribute(`${attribute}`);
  })
}

describe('extension utility functions', function() {
  this.timeout(20000); // default is 2 seconds and that may not be enough to boot browsers and pages.

  before(async function() {
    await pupp.launchBrowser();
    await pupp.testTextPage.bringToFront();
    page = pupp.testTextPage;
  });

  after(async function() {
    await pupp.browser.close();
  });

  // beforeEach(() => {
  //   window = (new JSDOM(documentHTML)).window;
  //   document = window.document;
  // });

  describe('getLangText', () => {
    it('identifies chinese text on page', () => {
      const language = "Chinese";
      const expected = [
        '比較大的字',
        '聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同……象中之司呢功度。',
        '的長集走在卻實報後間曾來放官……人證思念在我為投一越間例少臉管的的房跟衣。'
      ];
  
      const result = util.getLangText(document, language);

      expect(result).to.deep.equal(expected);
    })
  });

  describe('singleElementResizer', () => {
    describe('chinese language selected', () => {
      it("case 1: doesn't change english text", () => {
        const expected = 12;
        const el = document.getElementById('english-first');

        try { util.singleElementResizer(window, "Chinese", el, "16")}
        catch(err) { console.log(`element resize failed. Error: ${err}`)};
        const result = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));

        expect(result).to.equal(expected);
      })

      it.only("case 2: doesn't change header text when NFS is smaller", async () => {
        const expected = 24;

        // await page.evaluate((headers) => {
        //   console.log(`testing ${headers}`);
        // }, headers);
        const headerHandle = await page.evaluateHandle(() => {
          return document.getElementById('chinese-header')
        });
        const header = await page.evaluate(() => {
          return document.getElementById('chinese-header').innerHTML
        });
        let resultHandle = await page.evaluateHandle(headerHandle => {
          return window.getComputedStyle(headerHandle).getPropertyValue('font-size');
        }, headerHandle);
        // console.log(`getting element attributes...`);
        // pageEval = await page.evaluate(({header, attrValue}) => {
        //   // header = document.getElementsByTagName("body");
        //   // attrValue = window.getComputedStyle(header).getPropertyValue('data-original-font-size');
        //   return {header, attrValue};
        // }, {header, attrValue})
        // console.log(`pageEval = ${JSON.stringify(pageEval)}`);
        console.log(`header: ${header}`);
        console.log(`headerHandle: ${headerHandle}`);
        console.log(`starting FS: ${resultHandle}`);

        await page.evaluateHandle(headerHandle => {
          headerHandle.removeAttribute('font-size');
        }, headerHandle);
        resultHandle = await page.evaluateHandle(headerHandle => {
          return window.getComputedStyle(headerHandle).getPropertyValue('font-size')
        }, headerHandle)
        console.log(`removed FS: ${resultHandle}`)

        try { await page.evaluate(({header, util}) => {
          util.singleElementResizer(window, "Chinese", header, "16")}, {header, util})
        }
        catch(err) {console.log(`element resize failed. ${err}`)};
        const result = parseInt(await page.evaluateHandle(headerHandle => {
          return window.getComputedStyle(headerHandle).getPropertyValue('font-size')
        }, headerHandle));

        expect(result).to.equal(expected);
      })

      it("case 3: restores original font size if newFontSize is smaller than OFS", () => {
        const expected = 10;
        const el = document.getElementById('chinese-first');
        el.style.setProperty('data-original-font-size', expected + 'px');

        try { util.singleElementResizer(window, "Chinese", el, "8")}
        catch(err) {console.log(`element resize failed. ${err}`)};
        const result = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));

        expect(result).to.equal(expected);
      })

      it("case 4: reduces font size to newMinFontSize if NMFS >= orignal font size", () => {
        const expected = 10;
        const el = document.getElementById('chinese-first');
        el.style.setProperty('data-original-font-size', "8px");

        try { util.singleElementResizer(window, "Chinese", el, "10")}
        catch(err) {console.log(`element resize failed. ${err}`)};
        const result = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));

        expect(result).to.equal(expected);
      })

      it('case 5: enlarges chinese text and sets OFS', () => {
        const expected = 16;
        const el = document.getElementById('chinese-first');
        el.removeAttribute('data-original-font-size');

        try { util.singleElementResizer(window, "Chinese", el, expected);}
        catch(err) { console.log(`element resize failed. Error: ${err}`)};
        const result = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));
        const OFS = parseInt(window.getComputedStyle(el, null).getPropertyValue('data-original-font-size'));

        expect(result).to.equal(expected);
        expect(OFS).to.equal(12);
      })

      it("case 6: enlarges text where NMSF > original and current font size", () => {
        const expected = 20;
        const el = document.getElementById('chinese-first');
        el.style.setProperty('data-original-font-size', "10px");

        try { util.singleElementResizer(window, "Chinese", el, "20px")}
        catch(err) {console.log(`element resize failed. ${err}`)};
        const result = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));

        expect(result).to.equal(expected);
      })
    })
  })
})
