const { assert, expect } = require('chai');
const util = require('../util');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const documentHTML = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title><style>.test-text{font-size:12px}</style></head><body><section class="test-text" id="chinese-text">聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同……象中之司呢功度。<p>的長集走在卻實報後間曾來放官……人證思念在我為投一越間例少臉管的的房跟衣。</p></section><section class="test-text" id="english-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer lobortis, velit ut varius semper. <p>enim purus finibus lacus, tempor facilisis ligula dui sit amet urna. Proin in magna eget libero egestas aliquam. Nam vitae lacus turpis.</p></section></body></html>';

let window;
let document;

describe('extension utility functions', function() {
  beforeEach(() => {
    window = (new JSDOM(documentHTML)).window;
    document = window.document;
  });

  describe('language text finder function', () => {
    it('identifies chinese text on page', () => {
      const language = "Chinese";
      const expected = [
        '聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同……象中之司呢功度。',
        '的長集走在卻實報後間曾來放官……人證思念在我為投一越間例少臉管的的房跟衣。'
      ];
  
      const result = util.getLangText(document, language);

      expect(result).to.deep.equal(expected);
    })
  });

  describe('font-resizer function', () => {
    describe('chinese language selected', () => {
      it('enlarges chinese text', () => {
        const expected = 16;
        const el = document.getElementById('chinese-text');

        try { util.singleElementResizer(window, "Chinese", el, expected);}
        catch(err) { console.log(`element resize failed. Error: ${err}`)};
        const result = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));

        expect(result).to.equal(expected);
      })

      it('doesnt change english text', () => {
        const expected = 12;
        const el = document.getElementById('english-text');

        try { util.singleElementResizer(window, "Chinese", el, "16");}
        catch(err) { console.log(`element resize failed. Error: ${err}`)};
        const result = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));

        expect(result).to.equal(expected);
      })
    })
  })
})
