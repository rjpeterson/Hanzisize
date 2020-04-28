// language regex
const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;
const REGEX_ENGLISH = /^[a-zA-Z0-9$@$!%*?&#^-_. +]+$/;

const hanzisizeUtil = {
  // Error & function handling for language selection
  hasLanguage(lang, str) {
    switch (lang) {
      case 'English':
        return REGEX_ENGLISH.test(str);
      // case 'Portuguese':
      //   throw new Error('Sorry, Portuguese function not yet added')
      case 'Chinese':
        return REGEX_CHINESE.test(str);
      default:
        throw new Error('Invalid language was provided')
    }
  },

  // inputs a single element and a minumum font size. Sets font-size attribute of  element if current size is less than minFontSize
  resizeSingleElement(el, newMinFontSize) {
    // get font-size of element
    const currentFontSize = parseFloat(document.defaultView.getComputedStyle(el, null).getPropertyValue('font-size'));
    // compare font-size of element to newMinFontSize
    if (currentFontSize >= newMinFontSize) { 
      // if current text is originally larger than what we need, do nothing
      return
    } else {
      this.manageFontSize(el, newMinFontSize);
    }

    if (newMinFontSize > oldFontSize) {
      if (!el.isContentEditable || (el.parentNode && !el.parentNode.isContentEditable)) { // Version 1.2.7 - Fix contentEditable (gmail etc) - Changing to bold grows bigger
        el.style.setProperty('font-size', newMinFontSize + 'px', 'important')
        // Version 1.3.0 - Change line-height for websites like nytimes.com
        const curFontSize = parseInt(document.defaultView.getComputedStyle(el, null).getPropertyValue('font-size'))
        const curLineHeight = parseInt(document.defaultView.getComputedStyle(el, null).getPropertyValue('line-height'))
        if (curLineHeight !== 'normal' && curLineHeight <= (curFontSize + 1)) {
          el.style.setProperty('line-height', 'normal', 'important')
        }
      }
    }
  },

  // returns all elements with text of chosen language with optional callback for each step of loop
  getLangText(document, language, callback, callbackParam) {
    const langElems = [];
    // get all elements in DOM
    const allElems = document.getElementsByTagName('*')
    // loop through all elements
    for (let i = 0; i < allElems.length; i++) {
      const el = allElems[i]
      // if element has content that is not nested
      if (el.firstChild) {
        // log the content
        console.log(`content of element's first child : ${el.firstChild.nodeValue}`)
        // if language of content matches input language
        if (hasLanguage(language, el.firstChild.nodeValue)) {
          // console log for debugging
          console.log(`Element contains ${language} text`)
          langElems.push(el.firstChild.nodeValue);
          // // pass in resizeSingleElement function as callback
          // if (callback) {
          //   callback(el, callbackParam)
          // };
        } else {
          // console log for debugging
          console.log(`element does not contain ${language} text`
          )
        }
      }
    }
    return langElems;
  },

  // input a single element, target lang, and MFS, function will perform proper resizing procedure
  singleElementResizer(language, el, newMinFontSize) {
    const languageMatch = this.hasLanguage(language, el.firstChild.nodeValue);
    const currentFontSize = parseInt(document.defaultView.getComputedStyle(el, null).getPropertyValue('font-size'));
    const originalFontSize = parseInt(document.defaultView.getComputedStyle(el, null).getPropertyValue('original-font-size'));

    if (!languageMatch) {
      return
    } else { // language match
      if (currentFontSize > newMinFontSize) { // big text -> small text
        if (!originalFontSize) { // OFS not set, likely header text
          return
        } else if (originalFontSize > newMinFontSize) { 
          // text should never be smaller than OFS
          el.style.setProperty('font-size', originalFontSize + 'px', 'important')
        } else if (originalFontSize < newMinFontSize) {
          // text size reduced to NMFS, still larger than OFS
          el.style.setProperty('font-size', newMinFontSize + 'px', 'important')
        }
      } else if (currentFontSize < newMinFontSize) { // small -> big
        if (!originalFontSize) {
          // retain original font size for later use
          el.style.setProperty('original-font-size', currentFontSize + 'px', 'important');
        }
        // enlarge text
        el.style.setProperty('font-size', newMinFontSize + 'px', 'important');
      }
    }
  },

  // primary function for extension
  main(language, minFontSize) {
    getLangText(language, resizeSingleElement, minFontSize) 
  }
}

module.exports = hanzisizeUtil;