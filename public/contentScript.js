var test_mode = false;

const hanzisizeUtil = {
  REGEX_CHINESE: /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u,
  REGEX_JAPANESE: /[\u3041-\u3096]|[\u30A0-\u30FF]/, // katakana and hiragana only
  REGEX_ENGLISH: /[a-zA-Z]+/,

  // function applies new class to all elements that contain text at first child node
  tagTextElems() {
    $('body *').each(function(){
      if(this.childNodes[0].nodeValue && this.childNodes[0].nodeValue.trim().length !== 0) {
        $( this ).addClass('text-elem')
      }
    })
  },

  // function applies new class to all elements with text-elem class and match selected language
  tagLangElems(language) {
    $('.text-elem').each(function(){
      if(hanzisizeUtil.hasLanguage(language, this.firstChild.textContent)) {
        $( this ).addClass(`${language}-elem`)
      }
    })
  },

  // Error & function handling for language selection 
  hasLanguage(lang, str) {
    let result;
    switch (lang) {
      case 'Chinese':
        if (hanzisizeUtil.REGEX_CHINESE.test(str) && !hanzisizeUtil.REGEX_JAPANESE.test(str)) {
          result = true
        } else {
          result = false
        }
        break;
      case 'English':
        result = hanzisizeUtil.REGEX_ENGLISH.test(str);
        break;
      case 'Japanese':
        result = hanzisizeUtil.REGEX_JAPANESE.test(str);
        break;
      default:
        throw new Error('Invalid language was provided')
    }
    return result;
  },

  // returns all elements with text of chosen language with optional callback for each step of loop
  getElems(document, language, _singleElemResizer, newMinFontSize) {
    let languagePass;

    // get all elements in DOM
    const allElems = document.body.getElementsByTagName('*')
    for (let i = 0; i < allElems.length; i++) {
      const el = allElems[i];

      const elemText = el.childNodes[0].nodeValue;
      if (elemText) {// if element has text content that is not nested
        // check if content matches input language
        if (hanzisizeUtil.hasLanguage(language, elemText)) {
          // singleElementResizer function to be passed in as callback
          if (_singleElemResizer) {
            _singleElemResizer(window, el, newMinFontSize)
          };
        } else { // languagePass == false
          if(test_mode) {console.log(`case 1: element does not contain ${language} text`)}
        }
      }
    }
  },

  // input window, single element and NewMinFS, function will assess OFS, NMFS, CFS & perform proper resizing procedure
  //case 1: element does not contain ${language} text (getLangText function)
  //case 2: CurrentFS is original. No change
  //case 3: CurrentFS is not original and larger than NewMinFS. FS set to OriginalFS
  //case 4: CurrentFS is not original and less than or equal to NewMinFS. FS to NewMinFS
  //case 5: No OriginalFS. Save CurrentFS as OriginalFS. Set FS to NewMinFS
  //case 6: OriginalFS && (CurrentFS < NMFS), Set FS to NewMinFS
  singleElemResizer(window, el, newMinFontSize) {
    const currentFontSize = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));
    const originalFontSize = parseInt(window.getComputedStyle(el, null).getPropertyValue('--data-original-font-size'));

    if (currentFontSize === newMinFontSize) {
      if(test_mode) console.log('CFS equals NMFS. no change');

    } else if (currentFontSize > newMinFontSize) { // from big to small
      if(test_mode) {console.log(`CurentFS is larger than NewMinFS`)}

      if (!originalFontSize) { 
        if(test_mode) {console.log(`case 2: CurrentFS is original. No change`)}
        return;

      } else if (originalFontSize > newMinFontSize) { 
        if(test_mode) {console.log(`case 3: CurrentFS is not original and original is larger than NewMinFS. FS set to OriginalFS`)};

        el.style.setProperty('font-size', originalFontSize + 'px', 'important');
        hanzisizeUtil.adjustLineHeight(el, originalFontSize);

      } else {
        if(test_mode) {console.log(`case 4: CurrentFS is not original and less than or equal to NewMinFS. FS to NewMinFS`)};

        el.style.setProperty('font-size', newMinFontSize + 'px', 'important');
        hanzisizeUtil.adjustLineHeight(el, newMinFontSize);
      }
    } else { // CFS < NMFS   from small to big
      if(test_mode) {console.log(`CFS is less than NMFS`)}

      if (!originalFontSize) {
        if(test_mode) {console.log(`case 5: No OriginalFS. Save CurrentFS as OriginalFS. Set FS to NewMinFS`)};

        el.style.setProperty('--data-original-font-size', currentFontSize + 'px');
        el.style.setProperty('font-size', newMinFontSize + 'px', 'important');
        hanzisizeUtil.adjustLineHeight(el, newMinFontSize);

      } else {
        if(test_mode) {console.log(`case 6: OriginalFS && (CurrentFS < NMFS), Set FS to NewMinFS`)};

        el.style.setProperty('font-size', newMinFontSize + 'px', 'important');
        hanzisizeUtil.adjustLineHeight(el, newMinFontSize);
      }
    }
  },

  // This function is borrowed from APlus Font Size Changer
  // Version 1.3.0 - Change line-height for websites like nytimes.com
  adjustLineHeight(el, elFontSize) {
    const currentLineHeight = parseInt(window.getComputedStyle(el,null).getPropertyValue("line-height"));

    // if line height is too small for new text size, change line height to "normal"
    if (currentLineHeight !== "normal" && currentLineHeight <= (elFontSize+1)) {
      el.style.setProperty("line-height", "normal", "important");
    }
  },

  // primary function for extension
  main(language, minFontSize) {
    if(test_mode) console.log(`initiating main function...`);

    try {
      hanzisizeUtil.getElems(document, language, hanzisizeUtil.singleElemResizer, minFontSize)
    }
    catch(err) {console.log(`Hanzisize failed: ${err}`)}
  }
}

// add listener for message from extension popup
// this fails during testing, so we wrap it in a try catch block
try {
  chrome.runtime.onMessage.addListener(
    function(obj, sender, sendResponse) {
      if (test_mode) {
        console.log('object received by contentScript:' + JSON.stringify(obj) + 'Resizing now...')
      }

      // call resizing function with object properties received from popup
      hanzisizeUtil.main(obj.language, obj.newMinFontSize)
      sendResponse({farewell: "From content: I got the object."});
  });
}
catch(err) {if(test_mode) {console.log(err)}}

try { module.exports = hanzisizeUtil}
catch(err) {console.log(err + ".  'module' only necessary for testing purposes. Not needed in production.")}