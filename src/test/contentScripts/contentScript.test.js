import hanzisizeUtil from '../../../public/contentScript';
global.$ = require('jquery');

describe.only('hanzisizeUtil', () => {
  const englishString = "Morbi leo ex, vulputate id tortor sit amet, finibus pulvinar velit. ";
  const chineseString = "聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同";
  const japaneseString = "併メセ怖区山二やわはみ施請ざ南専のやぐ加単シネキ第朝東うた利34表ヤホセ断悪3請ハ";

  beforeEach(() => {
    jest.restoreAllMocks();
  })

  describe('regex', () => {
    describe('english regex', () => {
      test('it returns true on english text', () => {
        const result = hanzisizeUtil.REGEX_ENGLISH.test(englishString);

        expect(result).toBeTruthy()
      })    
      test('it returns false on chinese text', () => {
        const result = hanzisizeUtil.REGEX_ENGLISH.test(chineseString);

        expect(result).toBeFalsy()
      })
    })

    describe('chinese regex', () => {
      test('it returns true on chinese text', () => {
        const result = hanzisizeUtil.REGEX_CHINESE.test(chineseString);

        expect(result).toBeTruthy()
      })    
      // test('it returns false on japanese text', () => {
      //   const result = hanzisizeUtil.REGEX_CHINESE.test(japaneseString);

      //   expect(result).toBeFalsy()
      // })
    })

    describe('japanese regex', () => {
      test('it returns true on japanese text', () => {
        const result = hanzisizeUtil.REGEX_JAPANESE.test(japaneseString);

        expect(result).toBeTruthy()
      })    
      test('it returns false on chinese text', () => {
        const result = hanzisizeUtil.REGEX_JAPANESE.test(chineseString);

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
      test('Applies a new class to elements whose first child node contains text', () => {
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
        .mockReturnValueOnce(true);
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

  describe('hasLanguage', () => {
    const spyCN = jest.spyOn(hanzisizeUtil.REGEX_CHINESE, 'test');
    const spyEN = jest.spyOn(hanzisizeUtil.REGEX_ENGLISH, 'test');
    const spyJP = jest.spyOn(hanzisizeUtil.REGEX_JAPANESE, 'test');
    test('it correctly tests for Chinese', () => {
      spyCN.mockReturnValueOnce(true);
      spyCN.mockReturnValueOnce(false);

      const result1 = hanzisizeUtil.hasLanguage('Chinese', chineseString);
      const result2 = hanzisizeUtil.hasLanguage('Chinese', japaneseString);
      
      expect(result1).toBeTruthy();
      expect(result2).toBeFalsy();
    })
    test('it correctly tests for English', () => {
      spyEN.mockReturnValueOnce(true);
      spyEN.mockReturnValueOnce(false);

      const result1 = hanzisizeUtil.hasLanguage('English', englishString);
      const result2 = hanzisizeUtil.hasLanguage('English', japaneseString);
      
      expect(result1).toBeTruthy();
      expect(result2).toBeFalsy();
    })
    test('it correctly tests for Japanese', () => {
      spyJP.mockReturnValueOnce(true);
      spyJP.mockReturnValueOnce(false);

      const result1 = hanzisizeUtil.hasLanguage('Japanese', japaneseString);
      const result2 = hanzisizeUtil.hasLanguage('Japanese', chineseString);
      
      expect(result1).toBeTruthy();
      expect(result2).toBeFalsy();
    })
  })

  describe('getElems', () => {
    const { hasLanguage, singleElemResizer } = require('../../../public/contentScript')

    beforeAll(() => {
      document.body.innerHTML = 
      '<div>' +
      '<h1>Header <a href="google.com">Link</a></h1>' +
      '<p>聲我度都 <span>演人去</span>' +
      '</div>';
  
      hanzisizeUtil.hasLanguage = jest.fn()
      hanzisizeUtil.singleElemResizer = jest.fn()
  
      hanzisizeUtil.hasLanguage.mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
    })

    afterAll(() => {
      hanzisizeUtil.singleElemResizer = singleElemResizer;
      hanzisizeUtil.hasLanguage = hasLanguage;
    })

    test('it calls singleElemResizer on Chinese text elems with "Chinese" arg', () => {
      hanzisizeUtil.getElems(document, "Chinese", hanzisizeUtil.singleElemResizer, 20);

      expect(hanzisizeUtil.hasLanguage.mock.calls[0]).toEqual(["Chinese", "Header "]);
      expect(hanzisizeUtil.hasLanguage.mock.calls[1]).toEqual(["Chinese", "Link"]);
      expect(hanzisizeUtil.hasLanguage.mock.calls[2]).toEqual(["Chinese", "聲我度都 "]);
      expect(hanzisizeUtil.hasLanguage.mock.calls[3]).toEqual(["Chinese", "演人去"]);

      expect(hanzisizeUtil.singleElemResizer.mock.calls[0]).toEqual([window, document.querySelector('p'), 20])
      expect(hanzisizeUtil.singleElemResizer.mock.calls[1]).toEqual([window, document.querySelector('span'), 20]);
    })    
  })

  describe('singleElemResizer', () => {
    let spy;
    let elem;
    let originalFontSize;
    let fontSize;
    let newFontSize;

    beforeAll(() => {
      window.getComputedStyle = jest.fn();
      hanzisizeUtil.adjustLineHeight = jest.fn();
    })

    test('case 2', () => {
      originalFontSize = null;
      fontSize = 20;
      newFontSize = 15;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn()
        .mockReturnValueOnce(fontSize)
        .mockReturnValueOnce(originalFontSize)
      });
      document.body.innerHTML = '<div font-size="' + fontSize + '">聲我度都</div>';
      elem = document.querySelector('div');
      elem.style.setProperty = jest.fn()

      hanzisizeUtil.singleElemResizer(window, elem, newFontSize)

      expect(elem.style.setProperty).toHaveBeenCalledTimes(0);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(0);
    })

    test('case 3', () => {
      originalFontSize = 15;
      fontSize = 20;
      newFontSize = 10;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn()
        .mockReturnValueOnce(fontSize)
        .mockReturnValueOnce(originalFontSize)
      });
      document.body.innerHTML = '<div font-size="' + fontSize + '" --data-original-font-size="' + originalFontSize + '">聲我度都</div>';
      elem = document.querySelector('div');
      elem.style.setProperty = jest.fn()

      hanzisizeUtil.singleElemResizer(window, elem, newFontSize)

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith('font-size', `${originalFontSize}px`, 'important');

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(elem);
    })

    test('case 4', () => {
      originalFontSize = 15;
      fontSize = 20;
      newFontSize = 25;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn()
        .mockReturnValueOnce(fontSize)
        .mockReturnValueOnce(originalFontSize)
      });
      document.body.innerHTML = '<div font-size="' + fontSize + '" --data-original-font-size="' + originalFontSize + '">聲我度都</div>';
      elem = document.querySelector('div');
      elem.style.setProperty = jest.fn()

      hanzisizeUtil.singleElemResizer(window, elem, newFontSize)

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith('font-size', `${newFontSize}px`, 'important');

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(elem);
    })

    test('case 5', () => {
      originalFontSize = null;
      fontSize = 15;
      newFontSize = 20;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn()
        .mockReturnValueOnce(fontSize)
        .mockReturnValueOnce(originalFontSize)
      });
      document.body.innerHTML = '<div font-size="' + fontSize + '">聲我度都</div>';
      elem = document.querySelector('div');
      elem.style.setProperty = jest.fn()

      hanzisizeUtil.singleElemResizer(window, elem, newFontSize);

      expect(elem.style.setProperty).toHaveBeenCalledTimes(2);
      expect(elem.style.setProperty).toHaveBeenNthCalledWith(1, '--data-original-font-size', `${fontSize}px`);
      expect(elem.style.setProperty).toHaveBeenNthCalledWith(2, 'font-size', `${newFontSize}px`, 'important');

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(elem);
    })

    test('case 6', () => {
      originalFontSize = 10;
      fontSize = 15;
      newFontSize = 20;
      document.body.innerHTML = '<div font-size="' + fontSize + '" --data-original-font-size="' + originalFontSize +'">聲我度都</div>';
      elem = document.querySelector('div');
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn()
        .mockReturnValueOnce(fontSize)
        .mockReturnValueOnce(originalFontSize)
      });
      elem.style.setProperty = jest.fn();

      hanzisizeUtil.singleElemResizer(window, elem, newFontSize)

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith('font-size', `${newFontSize}px`, 'important');

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(elem);
    })
  })
})