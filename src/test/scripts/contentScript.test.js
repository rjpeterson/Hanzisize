import hanzisizeUtil from "../../../public/contentScript";
global.$ = require("jquery");
const originalHU = hanzisizeUtil;

describe("hanzisizeUtil", () => {
  const arabicString =
    "لكن لا بد أن أوضح لك أن كل هذه الأفكار المغلوطة حول استنكار  النشوة وتمجيد الألم نشأت بالفعل، وسأعرض لك التفاصيل لتكتشف حقيقة وأساس تلك السعادة البشر";
  const burmeseString =
    "သီးခြားသတ်မှတ်ပေးထားသည့် နံပါတ်များဖြစ်သည်။ ယူနီကုဒ် ဆိုသည်မှာ ကမ္ဘာသုံးစကား အားလုံးမှ အက္ခရာစာလုံး တစ်လုံးတိုင်းအတွက် တိကျသော နံပါတ် တစ်လုံးတည်းသာ သတ်မှတ်ပေးသော ဘုံသုံးစနစ်ဟူ၍လည်း ခေါ်ဆိုကြသည်။";
  const chineseString =
    "聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同";
  const englishString =
    "Morbi leo ex, vulputate id tortor sit amet, finibus pulvinar velit. ";
  const georgianString =
    "ლორემ იფსუმ დოლორ სით ამეთ, ლაორეეთ ფრობათუს ველ ცუ, ეხ ველ უნუმ მუნდი ევერთი. იმფედით";
  const hangulString =
    "그들은 찬미를 위하여서. 오직 있다. 같은 영원히 용감하고 얼음과 인생에 청춘의 전인 ? 고행을 열락의 때까지 불어 이상, ";
  const hebrewString =
    "הגרפים קודמות שתי אל, קבלו בחירות הקנאים אם זאת. ויש דת כלים פיסול, בקר והוא טכניים אחרונים דת. אם סדר תרבות קהילה לערוך, מה עוד לשון צרפתית לאחרונה";
  const hebrewAlphabet = "אּאּאּאּאּאּאּאּאּאּאּ";
  const hindiString =
    "उनके खरिदे आधुनिक वास्तविक तकनिकल व्रुद्धि समाज संदेश सादगि भारत वर्तमान अमितकुमार पहोच। हुआआदी व्रुद्धि भाषए कैसे";
  const japaneseString =
    "併メセ怖区山二やわはみ施請ざ南専のやぐ加単シネキ第朝東うた利34表ヤホセ断悪3請ハ";
  const thaiString =
    "เป็นข้อความแทนที่ ใช้เพื่อลดความสนใจต่อข้อความที่นำมาแสดง สำหรับการแสดงลักษณะของ";

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("regex", () => {
    describe("arabic regex", () => {
      test("it returns true on arabic text", () => {
        const result = hanzisizeUtil.REGEX_ARABIC.test(arabicString);

        expect(result).toBeTruthy();
      });
      test("it returns false on english text", () => {
        const result = hanzisizeUtil.REGEX_ARABIC.test(englishString);

        expect(result).toBeFalsy();
      });
    });

    describe("burmese regex", () => {
      test("it returns true on burmese text", () => {
        const result = hanzisizeUtil.REGEX_BURMESE.test(burmeseString);

        expect(result).toBeTruthy();
      });
      test("it returns false on english text", () => {
        const result = hanzisizeUtil.REGEX_BURMESE.test(englishString);

        expect(result).toBeFalsy();
      });
    });

    describe("chinese regex", () => {
      test("it returns true on chinese text", () => {
        const result = hanzisizeUtil.REGEX_CHINESE.test(chineseString);

        expect(result).toBeTruthy();
      });
      test("it returns false on english text", () => {
        const result = hanzisizeUtil.REGEX_CHINESE.test(englishString);

        expect(result).toBeFalsy();
      });
    });

    describe("english regex", () => {
      test("it returns true on english text", () => {
        const result = hanzisizeUtil.REGEX_ENGLISH.test(englishString);

        expect(result).toBeTruthy();
      });
      test("it returns false on chinese text", () => {
        const result = hanzisizeUtil.REGEX_ENGLISH.test(chineseString);

        expect(result).toBeFalsy();
      });
    });

    describe("georgian regex", () => {
      test("it returns true on georgian text", () => {
        const result = hanzisizeUtil.REGEX_GEORGIAN.test(georgianString);

        expect(result).toBeTruthy();
      });
      test("it returns false on english text", () => {
        const result = hanzisizeUtil.REGEX_GEORGIAN.test(englishString);

        expect(result).toBeFalsy();
      });
    });

    describe("hangul regex", () => {
      test("it returns true on hangul text", () => {
        const result = hanzisizeUtil.REGEX_HANGUL.test(hangulString);

        expect(result).toBeTruthy();
      });
      test("it returns false on english text", () => {
        const result = hanzisizeUtil.REGEX_HANGUL.test(englishString);

        expect(result).toBeFalsy();
      });
    });

    describe("hebrew regex", () => {
      test("it returns true on hebrew text", () => {
        const result = hanzisizeUtil.REGEX_HEBREW.test(hebrewString);

        expect(result).toBeTruthy();
      });
      test("it returns true on hebrew alphabetical text", () => {
        const result = hanzisizeUtil.REGEX_HEBREW.test(hebrewAlphabet);

        expect(result).toBeTruthy();
      });
      test("it returns false on english text", () => {
        const result = hanzisizeUtil.REGEX_HEBREW.test(englishString);

        expect(result).toBeFalsy();
      });
    });

    describe("hindi regex", () => {
      test("it returns true on hindi text", () => {
        const result = hanzisizeUtil.REGEX_HINDI.test(hindiString);

        expect(result).toBeTruthy();
      });
      test("it returns false on english text", () => {
        const result = hanzisizeUtil.REGEX_HINDI.test(englishString);

        expect(result).toBeFalsy();
      });
    });

    describe("japanese regex", () => {
      test("it returns true on japanese text", () => {
        const result = hanzisizeUtil.REGEX_CN_JP.test(japaneseString);

        expect(result).toBeTruthy();
      });
      test("it returns false on english text", () => {
        const result = hanzisizeUtil.REGEX_CN_JP.test(englishString);

        expect(result).toBeFalsy();
      });
    });

    describe("thai regex", () => {
      test("it returns true on thai text", () => {
        const result = hanzisizeUtil.REGEX_THAI.test(thaiString);

        expect(result).toBeTruthy();
      });
      test("it returns false on english text", () => {
        const result = hanzisizeUtil.REGEX_THAI.test(englishString);

        expect(result).toBeFalsy();
      });
    });
  });

  describe("Element tagging", () => {
    describe("tagTextElems", () => {
      beforeEach(() => {
        document.body.innerHTML =
          "<div>" + "<h1><span>Header</span> Text</h1>" + "</div>";
      });
      test("Applies a new class to elements whose contain a text node", () => {
        hanzisizeUtil.tagTextElems("body *");

        expect($("h1").hasClass("text-elem")).toBeTruthy();
        expect($("span").hasClass("text-elem")).toBeTruthy();
      });

      test("It does not apply a class to elements that do not contain a text node", () => {
        hanzisizeUtil.tagTextElems("body *");

        expect($("div").hasClass("text-elem")).toBeFalsy();
      });
    });

    describe("tagLangElems", () => {
      let spy;
      beforeEach(() => {
        document.body.innerHTML =
          "<div>" +
          '<h1 class="text-elem"><a class="text-elem" href="google.com">Header</a> Link</h1>' +
          '<p class="text-elem"><span>聲我度都</span>演人去' +
          "</div>";

        spy = jest.spyOn(hanzisizeUtil, "hasLanguage");
        spy
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(true);
      });

      test('Applies a language class to elements that have class "text-elem" and that contain text nodes of specified langauge', () => {
        hanzisizeUtil.tagLangElems("body *", "Chinese");

        expect($("p").hasClass("Chinese-elem")).toBeTruthy();
      });

      test('Does not apply a language class to elements that do not contain text of specified langauge, or do not have "text-elem" class', () => {
        hanzisizeUtil.tagTextElems("body *", "Chinese");

        expect($("div").hasClass("Chinese-elem")).toBeFalsy();
        expect($("h1").hasClass("Chinese-elem")).toBeFalsy();
        expect($("span").hasClass("Chinese-elem")).toBeFalsy();
      });
    });
  });

  describe("hasLanguage", () => {
    const spyCN = jest.spyOn(hanzisizeUtil.REGEX_CHINESE, "test");
    const spyEN = jest.spyOn(hanzisizeUtil.REGEX_ENGLISH, "test");
    const spyJP = jest.spyOn(hanzisizeUtil.REGEX_CN_JP, "test");
    test("it correctly tests for Chinese", () => {
      spyCN.mockReturnValueOnce(true);
      spyCN.mockReturnValueOnce(false);
      spyJP.mockReturnValueOnce(false);
      spyJP.mockReturnValueOnce(true);

      const result1 = hanzisizeUtil.hasLanguage("chinese", chineseString);
      const result2 = hanzisizeUtil.hasLanguage("chinese", englishString);

      expect(result1).toBeTruthy();
      expect(result2).toBeFalsy();
    });
    test("it correctly tests for English", () => {
      spyEN.mockReturnValueOnce(true);
      spyEN.mockReturnValueOnce(false);

      const result1 = hanzisizeUtil.hasLanguage("english", englishString);
      const result2 = hanzisizeUtil.hasLanguage("english", japaneseString);

      expect(result1).toBeTruthy();
      expect(result2).toBeFalsy();
    });
    test("it correctly tests for Japanese", () => {
      spyJP.mockReturnValueOnce(true);
      spyJP.mockReturnValueOnce(false);

      const result1 = hanzisizeUtil.hasLanguage("japanese", japaneseString);
      const result2 = hanzisizeUtil.hasLanguage("japanese", englishString);

      expect(result1).toBeTruthy();
      expect(result2).toBeFalsy();
    });
  });

  describe("cycleThroughElems", () => {
    let mockCallback;

    beforeEach(() => {
      document.body.innerHTML =
        "<div>" +
        '<h1>Header <a href="google.com">Link</a></h1>' +
        '<p class="chinese-elem">聲我度都 <span class="chinese-elem">演人去</span>' +
        "</div>";
      mockCallback = jest.fn();
    });

    test('it calls a callback on all elems that have "chinese-elem" class when passed "Chinese" arg', () => {
      hanzisizeUtil.cycleThroughElems("body", "chinese", mockCallback, 20);

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenNthCalledWith(
        1,
        document.querySelector("p"),
        20
      );
      expect(mockCallback).toHaveBeenNthCalledWith(
        2,
        document.querySelector("span"),
        20
      );
    });
  });

  describe("singleElemResizer", () => {
    const ALH = hanzisizeUtil.adjustLineHeight;
    let spy;
    let elem;
    let originalFontSize;
    let fontSize;
    let newFontSize;

    beforeAll(() => {
      window.getComputedStyle = jest.fn();
      hanzisizeUtil.adjustLineHeight = jest.fn();
    });

    afterAll(() => {
      hanzisizeUtil.adjustLineHeight = ALH;
    });

    test("case 2", () => {
      originalFontSize = null;
      fontSize = 20;
      newFontSize = 15;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest
          .fn()
          .mockReturnValueOnce(fontSize)
          .mockReturnValueOnce(originalFontSize),
      });
      document.body.innerHTML =
        '<div font-size="' + fontSize + '">聲我度都</div>';
      elem = document.querySelector("div");
      elem.style.setProperty = jest.fn();

      hanzisizeUtil.singleElemResizer(elem, newFontSize);

      expect(elem.style.setProperty).toHaveBeenCalledTimes(0);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(0);
    });

    test("case 3", () => {
      originalFontSize = 15;
      fontSize = 20;
      newFontSize = 10;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest
          .fn()
          .mockReturnValueOnce(fontSize)
          .mockReturnValueOnce(originalFontSize),
      });
      document.body.innerHTML =
        '<div font-size="' +
        fontSize +
        '" --data-original-font-size="' +
        originalFontSize +
        '">聲我度都</div>';
      elem = document.querySelector("div");
      elem.style.setProperty = jest.fn();

      hanzisizeUtil.singleElemResizer(elem, newFontSize);

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith(
        "font-size",
        `${originalFontSize}px`,
        "important"
      );

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(
        elem,
        originalFontSize
      );
    });

    test("case 4", () => {
      originalFontSize = 15;
      fontSize = 20;
      newFontSize = 25;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest
          .fn()
          .mockReturnValueOnce(fontSize)
          .mockReturnValueOnce(originalFontSize),
      });
      document.body.innerHTML =
        '<div font-size="' +
        fontSize +
        '" --data-original-font-size="' +
        originalFontSize +
        '">聲我度都</div>';
      elem = document.querySelector("div");
      elem.style.setProperty = jest.fn();

      hanzisizeUtil.singleElemResizer(elem, newFontSize);

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith(
        "font-size",
        `${newFontSize}px`,
        "important"
      );

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(
        elem,
        newFontSize
      );
    });

    test("case 5", () => {
      originalFontSize = null;
      fontSize = 15;
      newFontSize = 20;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest
          .fn()
          .mockReturnValueOnce(fontSize)
          .mockReturnValueOnce(originalFontSize),
      });
      document.body.innerHTML =
        '<div font-size="' + fontSize + '">聲我度都</div>';
      elem = document.querySelector("div");
      elem.style.setProperty = jest.fn();

      hanzisizeUtil.singleElemResizer(elem, newFontSize);

      expect(elem.style.setProperty).toHaveBeenCalledTimes(2);
      expect(elem.style.setProperty).toHaveBeenNthCalledWith(
        1,
        "--data-original-font-size",
        `${fontSize}px`
      );
      expect(elem.style.setProperty).toHaveBeenNthCalledWith(
        2,
        "font-size",
        `${newFontSize}px`,
        "important"
      );

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(
        elem,
        newFontSize
      );
    });

    test("case 6", () => {
      originalFontSize = 10;
      fontSize = 15;
      newFontSize = 20;
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest
          .fn()
          .mockReturnValueOnce(fontSize)
          .mockReturnValueOnce(originalFontSize),
      });
      document.body.innerHTML =
        '<div font-size="' +
        fontSize +
        '" --data-original-font-size="' +
        originalFontSize +
        '">聲我度都</div>';
      elem = document.querySelector("div");
      elem.style.setProperty = jest.fn();

      hanzisizeUtil.singleElemResizer(elem, newFontSize);

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith(
        "font-size",
        `${newFontSize}px`,
        "important"
      );

      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledTimes(1);
      expect(hanzisizeUtil.adjustLineHeight).toHaveBeenCalledWith(
        elem,
        newFontSize
      );
    });
  });

  describe("adjustLineHeight", () => {
    test("it properly adjusts lineHeight when undersized", () => {
      const fontSize = 15;
      window.getComputedStyle = jest.fn();
      window.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValueOnce(10),
      });
      document.body.innerHTML =
        '<div font-size="' + fontSize + '">聲我度都</div>';
      const elem = document.querySelector("div");
      elem.style.setProperty = jest.fn();

      hanzisizeUtil.adjustLineHeight(elem, fontSize);

      expect(elem.style.setProperty).toHaveBeenCalledTimes(1);
      expect(elem.style.setProperty).toHaveBeenCalledWith(
        "line-height",
        "normal",
        "important"
      );
    });
  });

  describe("main", () => {
    beforeEach(() => {
      hanzisizeUtil.tagTextElems = jest.fn();
      hanzisizeUtil.tagLangElems = jest.fn();
      hanzisizeUtil.cycleThroughElems = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      hanzisizeUtil = originalHU;
    });

    test('it calls tagTextElems, tagLangElems, and cycleThroughElems with the proper args in "initial" mode', () => {
      const language = "chinese";
      const minFontSize = 12;
      const mode = "initial";

      hanzisizeUtil.main(language, minFontSize, mode);

      expect(hanzisizeUtil.tagTextElems).toHaveBeenCalledWith("body *");
      expect(hanzisizeUtil.tagLangElems).toHaveBeenCalledWith(
        "body *",
        language
      );
      expect(hanzisizeUtil.cycleThroughElems).toHaveBeenCalledWith(
        "body",
        language,
        hanzisizeUtil.singleElemResizer,
        minFontSize
      );
    });

    test('it calls tagLangElems and cycleThroughElems with the proper args in "lang-change" mode', () => {
      const language = "chinese";
      const minFontSize = 12;
      const mode = "lang-change";

      hanzisizeUtil.main(language, minFontSize, mode);

      expect(hanzisizeUtil.tagTextElems).toHaveBeenCalledTimes(0);
      expect(hanzisizeUtil.tagLangElems).toHaveBeenCalledWith(
        "body *",
        language
      );
      expect(hanzisizeUtil.cycleThroughElems).toHaveBeenCalledWith(
        "body",
        language,
        hanzisizeUtil.singleElemResizer,
        minFontSize
      );
    });

    test('it calls tagLangElems and cycleThroughElems with the proper args in "fontsize-change" mode', () => {
      const language = "chinese";
      const minFontSize = 12;
      const mode = "fontsize-change";

      hanzisizeUtil.main(language, minFontSize, mode);

      expect(hanzisizeUtil.tagTextElems).toHaveBeenCalledTimes(0);
      expect(hanzisizeUtil.tagLangElems).toHaveBeenCalledTimes(0);
      expect(hanzisizeUtil.cycleThroughElems).toHaveBeenCalledWith(
        "body",
        language,
        hanzisizeUtil.singleElemResizer,
        minFontSize
      );
    });

    test('it calls tagTextElems, tagLangElems, and cycleThroughElems with the proper args in "mutation" mode', () => {
      const language = "chinese";
      const minFontSize = 12;
      const mode = "mutation";

      hanzisizeUtil.main(language, minFontSize, mode, "mock node");

      expect(hanzisizeUtil.tagTextElems).toHaveBeenCalledWith("mock node");
      expect(hanzisizeUtil.tagLangElems).toHaveBeenCalledWith(
        "mock node",
        language
      );
      expect(hanzisizeUtil.cycleThroughElems).toHaveBeenCalledWith(
        "mock node",
        language,
        hanzisizeUtil.singleElemResizer,
        minFontSize
      );
    });
  });
});
