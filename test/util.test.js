const { assert, expect } = require('chai');
const util = require('../util');
const pupBrowser = require('./testBoot');
// const jsdom = require('jsdom');
// const { JSDOM } = jsdom;


// // apparently jsdom cant compute style attribute inheritance, so we have to set font-size for each element individually for testing purposes... NOT IDEAL...
// const documentHTML = '<!DOCTYPE html><html lang="en"><head>' + 
// '<meta charset="UTF-8">' + 
// '<meta name="viewport" content="width=device-width, initial-scale=1.0">' + 
// '<title>Document</title>' + 
// '<style>' + 
// '.test-text, #chinese-first, #english-first {font-size:12px; data-original-font-size:12px}' +
// '#chinese-header {font-size:24px; data-original-font-size:24px}' +
// '</style>' +
// '</head>' + 
// '<body>' + 
// '<section class="test-text" id="chinese-section" font-size:12px; data-original-font-size:12px>' + 
// '<h1 id="chinese-header" font-size:24px; data-original-font-size:24px>比較大的字</h1>' + 
// '<p class="chinese-text" id="chinese-first" font-size:12px; data-original-font-size:12px>聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同……象中之司呢功度。</p>' + 
// '<p class="chinese-text">的長集走在卻實報後間曾來放官……人證思念在我為投一越間例少臉管的的房跟衣。</p>' + 
// '</section>' + 
// '<section class="test-text" id="english-section" font-size:12px; data-original-font-size:12px>' +
// '<h1 id="english-header">This is an english header</h1>' +  
// '<p class="english-text" id="english-first" font-size:12px; data-original-font-size:12px>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer lobortis, velit ut varius semper. </p>' + 
// '<p class="english-text">enim purus finibus lacus, tempor facilisis ligula dui sit amet urna. Proin in magna eget libero egestas aliquam. Nam vitae lacus turpis.</p>' + 
// '</section></body></html>';

// let window;
// let document;

const getElementText = async (el) => {
  const elText = await pupBrowser.testTextPage.$eval(`${el}`, e => e.innerText);
  return elText;
}
const getElementValue = async (el) => {
  const elText = await pupBrowser.testTextPage.$eval(`${el}`, e => e.value);
  return elText;
}

const getAttributeValue = async (elementId, attribute) => {
  const attrValue = await pupBrowser.testTextPage.evaluate(() => {
    const el = document.getElementById(elementId);
    return window.getComputedStyle(el).getPropertyValue(attribute)
  })
  return attrValue;
}

const removeAttributeValue = async (elID, attribute) => {
  await pupBrowser.testTextPage.evaluate(() => {
    const el = document.getElementById(`${elID}`);
    el.removeAttribute(`${attribute}`);
  })
}

describe('extension utility functions', function() {
  this.timeout(20000); // default is 2 seconds and that may not be enough to boot browsers and pages.

  before(async function() {
    await pupBrowser.launchBrowser();
  });

  after(async function() {
    await pupBrowser.browser.close();
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
        // const el = document.getElementById('chinese-header');
        const el = pupBrowser.testTextPage.$('#chinese-header')
        // const attr = el.attributes;
        // for (var i = 0; i < attr.length; i++) {
        //   console.log( attr[i].name, attr[i].value);
        // };
        // console.log(`starting OFS: ${parseInt(window.getComputedStyle(el, null).getPropertyValue('data-original-font-size'))}`)
        let attrValue = await pupBrowser.testTextPage.evaluate(() => {
          const el = document.getElementById('chinese-header');
          return window.getComputedStyle(el).getPropertyValue('data-original-font-size')
        })
        console.log(`starting OFS: ${attrValue}`);
        await pupBrowser.testTextPage.evaluate(() => {
          const el = document.getElementById('chinese-header');
          el.removeAttribute('data-original-font-size');
        });
        // console.log(`removed OFS: ${parseInt(window.getComputedStyle(el, null).getPropertyValue('data-original-font-size'))}`)
        attrValue = await pupBrowser.testTextPage.evaluate(() => {
          const el = document.getElementById('chinese-header');
          return window.getComputedStyle(el).getPropertyValue('data-original-font-size')
        })
        console.log(`removed OFS: ${attrValue}`)

        try { util.singleElementResizer(pupBrowser.testTextPage, "Chinese", el, "16")}
        catch(err) {console.log(`element resize failed. ${err}`)};
        // const result = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));
        const result = parseInt(await pupBrowser.testTextPage.evaluate(() => {
          const el = document.getElementById('chinese-header');
          return window.getComputedStyle(el).getPropertyValue('font-size')
        }));

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
