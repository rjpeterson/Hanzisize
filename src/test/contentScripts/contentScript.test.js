import hanzisizeUtil from '../../../public/contentScript';
global.$ = require('jquery');
const originalHU = hanzisizeUtil;

describe('hanzisizeUtil', () => {
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
    describe('tagTextElems', () => {
      beforeEach(() => {
        document.body.innerHTML = 
        '<div>' +
        '<h1><span>Header</span> Text</h1>' +
        '</div>';
      })
      test('Applies a new class to elements whose contain a text node', () => {
        hanzisizeUtil.tagTextElems('body *')

        expect($('h1').hasClass('text-elem')).toBeTruthy();
        expect($('span').hasClass('text-elem')).toBeTruthy();
      })

      test('It does not apply a class to elements that do not contain a text node', () => {
        hanzisizeUtil.tagTextElems('body *')

        expect($('div').hasClass('text-elem')).toBeFalsy();
      })
    })
    
    describe('tagLangElems', () => {
      let spy;
      beforeEach(() => {
        document.body.innerHTML = 
        '<div>' +
        '<h1 class="text-elem"><a class="text-elem" href="google.com">Header</a> Link</h1>' +
        '<p class="text-elem"><span>聲我度都</span>演人去' +
        '</div>';

        spy = jest.spyOn(hanzisizeUtil, 'hasLanguage');
        spy.mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      })

      test('Applies a language class to elements that have class "text-elem" and that contain text nodes of specified langauge', () => {
        hanzisizeUtil.tagLangElems('body *', 'Chinese')

        expect($('p').hasClass('Chinese-elem')).toBeTruthy();
      })

      test('Does not apply a language class to elements that do not contain text of specified langauge, or do not have "text-elem" class', () => {
        hanzisizeUtil.tagTextElems('body *', 'Chinese')

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
      spyJP.mockReturnValueOnce(false)
      spyJP.mockReturnValueOnce(true);

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

  describe('resizeElems', () => {
    let mockCallback;

    beforeEach(() => {
      document.body.innerHTML = 
      '<div>' +
      '<h1>Header <a href="google.com">Link</a></h1>' +
      '<p class="chinese-elem">聲我度都 <span class="chinese-elem">演人去</span>' +
      '</div>';
      mockCallback = jest.fn();
    })

    test('it calls a callback on all elems that have "chinese-elem" class when passed "Chinese" arg', () => {
      hanzisizeUtil.resizeElems('body', "chinese", mockCallback, 20);

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenNthCalledWith(1,document.querySelector('p'), 20);
      expect(mockCallback).toHaveBeenNthCalledWith(2,document.querySelector('span'), 20);
    })    
  })

  describe('singleElemResizer', () => {
    const ALH = hanzisizeUtil.adjustLineHeight;
    let spy;
    let elem;
    let originalFontSize;
    let fontSize;
    let newFontSize;

    beforeAll(() => {
      window.getComputedStyle = jest.fn();
      hanzisizeUtil.adjustLineHeight = jest.fn();
    })

    afterAll(() => {
      hanzisizeUtil.adjustLineHeight = ALH;
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

      hanzisizeUtil.singleElemResizer(elem, newFontSize)

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

      hanzisizeUtil.singleElemResizer(elem, newFontSize)

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith('font-size', `${originalFontSize}px`, 'important');

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(elem, originalFontSize);
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

      hanzisizeUtil.singleElemResizer(elem, newFontSize)

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith('font-size', `${newFontSize}px`, 'important');

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(elem, newFontSize);
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

      hanzisizeUtil.singleElemResizer(elem, newFontSize);

      expect(elem.style.setProperty).toHaveBeenCalledTimes(2);
      expect(elem.style.setProperty).toHaveBeenNthCalledWith(1, '--data-original-font-size', `${fontSize}px`);
      expect(elem.style.setProperty).toHaveBeenNthCalledWith(2, 'font-size', `${newFontSize}px`, 'important');

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(elem, newFontSize);
    })

    test('case 6', () => {
      originalFontSize = 10;
      fontSize = 15;
      newFontSize = 20;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn()
        .mockReturnValueOnce(fontSize)
        .mockReturnValueOnce(originalFontSize)
      });
      document.body.innerHTML = '<div font-size="' + fontSize + '" --data-original-font-size="' + originalFontSize +'">聲我度都</div>';
      elem = document.querySelector('div');
      elem.style.setProperty = jest.fn();


      hanzisizeUtil.singleElemResizer(elem, newFontSize)

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith('font-size', `${newFontSize}px`, 'important');

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(elem, newFontSize);
    })
  })

  describe('adjustLineHeight', () => {
    test('it properly adjusts lineHeight when undersized', () => {
      const fontSize = 15;
      window.getComputedStyle = jest.fn();
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn()
        .mockReturnValueOnce(10)
      });
      document.body.innerHTML = '<div font-size="' + fontSize +'">聲我度都</div>';
      const elem = document.querySelector('div');
      elem.style.setProperty = jest.fn();

      hanzisizeUtil.adjustLineHeight(elem, fontSize)

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith("line-height", "normal", "important");
    })
  })

  describe('main', () => {
    beforeEach(() => {
      hanzisizeUtil.tagTextElems = jest.fn();
      hanzisizeUtil.tagLangElems = jest.fn();
      hanzisizeUtil.resizeElems = jest.fn();
    })

    afterAll(() => {
      hanzisizeUtil = originalHU;
    })

    test('it calls tagTextElems, tagLangElems, and resizeElems with the proper args in "initial" mode', () => {
      const language = "Chinese";
      const minFontSize = 12;
      const mode = "initial";
  
      hanzisizeUtil.main(language, minFontSize, mode);
      
      expect(hanzisizeUtil.tagTextElems).toHaveBeenCalledWith('body *');
      expect(hanzisizeUtil.tagLangElems).toHaveBeenCalledWith('body *', language);
      expect(hanzisizeUtil.resizeElems).toHaveBeenCalledWith('body', language, hanzisizeUtil.singleElemResizer, minFontSize);
    })
    
    test('it calls tagLangElems and resizeElems with the proper args in "lang-change" mode', () => {
      const language = "Chinese";
      const minFontSize = 12;
      const mode = "initial";
  
      hanzisizeUtil.main(language, minFontSize, mode);
      
      expect(hanzisizeUtil.tagLangElems).toHaveBeenCalledWith('body *', language);
      expect(hanzisizeUtil.resizeElems).toHaveBeenCalledWith('body', language, hanzisizeUtil.singleElemResizer, minFontSize);
    })

    test('it calls tagTextElems, tagLangElems, and resizeElems with the proper args in "mutation" mode', () => {
      const language = "Chinese";
      const minFontSize = 12;
      const mode = "mutation";
  
      hanzisizeUtil.main(language, minFontSize, mode, 'mock node');
      
      expect(hanzisizeUtil.tagTextElems).toHaveBeenCalledWith('mock node');
      expect(hanzisizeUtil.tagLangElems).toHaveBeenCalledWith('mock node', language);
      expect(hanzisizeUtil.resizeElems).toHaveBeenCalledWith('mock node', language, hanzisizeUtil.singleElemResizer, minFontSize);
    })
  })
})