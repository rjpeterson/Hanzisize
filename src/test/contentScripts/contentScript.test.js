import hanzisizeUtil from '../../../public/contentScript';
global.$ = require('jquery');

describe.only('hanzisizeUtil', () => {
  describe('regex', () => {
    describe('english regex', () => {
      test('it returns true on english text', () => {
        const testString = 'Morbi leo ex, vulputate id tortor sit amet, finibus pulvinar velit. ';

        const result = hanzisizeUtil.REGEX_ENGLISH.test(testString);

        expect(result).toBeTruthy()
      })    
      test('it returns false on chinese text', () => {
        const testString = '聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同';

        const result = hanzisizeUtil.REGEX_ENGLISH.test(testString);

        expect(result).toBeFalsy()
      })
    })

    describe('chinese regex', () => {
      test('it returns true on chinese text', () => {
        const testString = '聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同';

        const result = hanzisizeUtil.REGEX_CHINESE.test(testString);

        expect(result).toBeTruthy()
      })    
      // test('it returns false on japanese text', () => {
      //   const testString = '併メセ怖区山二やわはみ施請ざ南専のやぐ加単シネキ第朝東うた利34表ヤホセ断悪3請ハ';

      //   const result = hanzisizeUtil.REGEX_CHINESE.test(testString);

      //   expect(result).toBeFalsy()
      // })
    })

    describe('japanese regex', () => {
      test('it returns true on japanese text', () => {
        const testString = '併メセ怖区山二やわはみ施請ざ南専のやぐ加単シネキ第朝東うた利34表ヤホセ断悪3請ハ';

        const result = hanzisizeUtil.REGEX_JAPANESE.test(testString);

        expect(result).toBeTruthy()
      })    
      test('it returns false on chinese text', () => {
        const testString = '聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同';

        const result = hanzisizeUtil.REGEX_JAPANESE.test(testString);

        expect(result).toBeFalsy()
      })
    })
  })

  describe('Element tagging', () => {
    describe('tagTextElem', () => {
      beforeEach(() => {
        document.body.innerHTML = 
        '<div>' +
        '<h1>Header <span>Text</span></h1>' +
        '</div>';
      })
      test.only('Applies a new class to elements whose first child node contains text', () => {
        hanzisizeUtil.tagTextElems()

        expect($('h1').hasClass('text-elem')).toBeTruthy();
        expect($('span').hasClass('text-elem')).toBeTruthy();
      })

      test('It does not apply a class to elements whose first child node does not contain text', () => {
        hanzisizeUtil.tagTextElems()

        expect($('div').hasClass('text-elem')).toBeFalsy();
      })
    })
    
    describe('tagLangElem', () => {
      let spy;
      beforeEach(() => {
        document.body.innerHTML = 
        '<div>' +
        '<h1 class="text-elem">Header <a class="text-elem" href="google.com">Link</a></h1>' +
        '<p class="text-elem">聲我度都 <span>演人去</span>' +
        '</div>';

        spy = jest.spyOn(hanzisizeUtil, 'hasLanguage');
        spy.mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      })

      test('Applies a new class to elements with class "text-elem" whose first child node contains text of specified langauge', () => {
        hanzisizeUtil.tagLangElems('Chinese')

        expect($('p').hasClass('Chinese-elem')).toBeTruthy();
      })

      test('Does not apply a new class to elements whose first child node does not contain text of specified langauge, or does not have text-elem class', () => {
        hanzisizeUtil.tagTextElems('Chinese')

        expect($('div').hasClass('Chinese-elem')).toBeFalsy();
        expect($('h1').hasClass('Chinese-elem')).toBeFalsy();
        expect($('span').hasClass('Chinese-elem')).toBeFalsy();
      })
    })
  })
})