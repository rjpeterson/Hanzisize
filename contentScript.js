let test_mode = true;

const hanzisizeUtil = {
  REGEX_CHINESE: /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u,
  REGEX_ENGLISH: /^[a-zA-Z0-9$@$!%*?&#^-_. +]+$/,

  // Error & function handling for language selection 
  // 6/12/2020 LANGUAGE SELECTION NOT YET IMPLEMENTED INTO POPUP
  hasLanguage(lang, str) {
    switch (lang) {
      case 'English':
        return hanzisizeUtil.REGEX_ENGLISH.test(str);
      case 'Chinese':
        return hanzisizeUtil.REGEX_CHINESE.test(str);
      default:
        throw new Error('Invalid language was provided')
    }
  },

  // returns all elements with text of chosen language with optional callback for each step of loop
  getLangText(document, language, singleElementResizerCallback, newMinFontSize) {
    let languagePass;
    const langElems = [];

    if(test_mode) {
      console.log(`newMinFontSize: ${newMinFontSize} | initiating getLangText...`)
    }

    // get all elements in DOM
    const allElems = document.getElementsByTagName('*')
    for (let i = 0; i < allElems.length; i++) {
      const el = allElems[i];
      if (el.firstChild) {// if element has content that is not nested
        const elText = el.firstChild.nodeValue;

        if(test_mode) {console.log(`content of element's first child : ${elText}`)};
        
        try { // check if content matches input language
          languagePass = hanzisizeUtil.hasLanguage(language, elText)
        } catch (error) {
          if(test_mode) console.log('hasLanguage function error:' + error)
        };

        if (languagePass) {
          if(test_mode) {console.log(`Element contains ${language} text`)};
          langElems.push(elText);

          // singleElementResizer function to be passed in as callback
          if (singleElementResizerCallback) {
            if(test_mode) {console.log(`passing element and NMFS to callback function. NMFS: ${newMinFontSize}`)}
            singleElementResizerCallback(window, el, newMinFontSize)
          };
        } else { // languagePass == false
          if(test_mode) {console.log(`case 1: element does not contain ${language} text`)}
        }
      }
    } //end for loop
    return langElems; //mainly for testing purposes
  },

  // input window, single element and NewMinFS, function will assess OFS, NMFS, CFS & perform proper resizing procedure
  //case 1: element does not contain ${language} text (getLangText function)
  //case 2: CurrentFS is original. No change
  //case 3: CurrentFS is not original and larger than NewMinFS. FS set to OriginalFS
  //case 4: CurrentFS is not original and less than or equal to NewMinFS. FS to NewMinFS
  //case 5: No OriginalFS. Save CurrentFS as OriginalFS. Set FS to NewMinFS
  //case 6: OriginalFS && (CurrentFS < NMFS), Set FS to NewMinFS
  singleElementResizer(window, el, newMinFontSize) {
    const currentFontSize = parseInt(window.getComputedStyle(el, null).getPropertyValue('font-size'));
    const originalFontSize = parseInt(window.getComputedStyle(el, null).getPropertyValue('--data-original-font-size'));

      if(test_mode) {
        console.log(`initiating singleElementResizer`)
        console.log(`current font size: ${currentFontSize}`)
        console.log(`new min font size: ${newMinFontSize}`)
        if(isNaN(originalFontSize)) {
          console.log(`originalFontSize not found`);
        } else {
          console.log(`originalFontSize: ${originalFontSize}`);
        }
      }

    if (currentFontSize == newMinFontSize) {
      if(test_mode) console.log('CFS equals NMFS. no change');

    } else if (currentFontSize > newMinFontSize) { // from big to small
      if(test_mode) {console.log(`CurentFS is larger than NewMinFS`)}

      if (!originalFontSize) { 
        if(test_mode) {console.log(`case 2: CurrentFS is original. No change`)}
        return
      } else if (originalFontSize > newMinFontSize) { 
        if(test_mode) {console.log(`case 3: CurrentFS is not original and larger than NewMinFS. FS set to OriginalFS`)};
        el.style.setProperty('font-size', originalFontSize + 'px', 'important');
      } else {
        if(test_mode) {console.log(`case 4: CurrentFS is not original and less than or equal to NewMinFS. FS to NewMinFS`)};
        el.style.setProperty('font-size', newMinFontSize + 'px', 'important');
      }
    } else { // CFS < NMFS   from small to big
      if(test_mode) {console.log(`CFS is less than NMFS`)}
      if (!originalFontSize) {
        if(test_mode) {console.log(`case 5: No OriginalFS. Save CurrentFS as OriginalFS. Set FS to NewMinFS`)};
        el.style.setProperty('--data-original-font-size', currentFontSize + 'px');
        el.style.setProperty('font-size', newMinFontSize + 'px', 'important');
      } else {
      if(test_mode) {console.log(`case 6: OriginalFS && (CurrentFS < NMFS), Set FS to NewMinFS`)};
      el.style.setProperty('font-size', newMinFontSize + 'px', 'important');
      }
    }
  },

  // primary function for extension
  main(language, minFontSize) {
    if(test_mode) console.log(`initiating main function...`);
    try {
      hanzisizeUtil.getLangText(document, language, hanzisizeUtil.singleElementResizer, minFontSize)
    }
    catch(err) {console.log(`Hanzisize failed: ${err}`)}
  }
}

chrome.runtime.onMessage.addListener(
	function(obj, sender, sendResponse) {
      if (test_mode) {
        console.log('object received by contentScript:' + JSON.stringify(obj) + 'Resizing now...')
      }

      hanzisizeUtil.main(obj.language, obj.newMinFontSize)
      sendResponse({farewell: "From content: I got the object."});
  });