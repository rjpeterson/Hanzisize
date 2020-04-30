const { assert, expect } = require('chai');
const util = require('../util');
const pupBrowser = require('./testBoot');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const documentHTML = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body><section class="test-text" id="chinese-text">聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同……象中之司呢功度。<p>的長集走在卻實報後間曾來放官……人證思念在我為投一越間例少臉管的的房跟衣。</p></section><section class="test-text" id="english-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer lobortis, velit ut varius semper.' + '\n\n' + 'enim purus finibus lacus, tempor facilisis ligula dui sit amet urna. Proin in magna eget libero egestas aliquam. Nam vitae lacus turpis.</section></body></html>';

const document = (new JSDOM(documentHTML)).window.document;

describe('extension utility functions', function() {
  // this.timeout(20000); // default is 2 seconds and that may not be enough to boot browsers and pages.

  // before(async function() {
  //   await pupBrowser.launchBrowser();
  // });
  // after(async function() {
  //   await pupBrowser.browser.close();
  // });

  describe('chinese finder function', () => {
    it.only('identifies chinese text on page', () => {
      const language = "Chinese";
      const expected = [
        '聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同……象中之司呢功度。',
        '的長集走在卻實報後間曾來放官……人證思念在我為投一越間例少臉管的的房跟衣。'
      ];
  
      const result = util.getLangText(document, language);
      
      expect(result).to.deep.equal(expected);
    })
    it('changes size of chinese text', () => {
      
    })
    it('doesnt change the size of english text', () => {
  
    })
  })
})
