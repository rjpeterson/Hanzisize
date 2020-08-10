var test_mode = false;
let mostRecentSettings;

const hanzisizeUtil = {
  REGEX_CHINESE: /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u,
  REGEX_JAPANESE: /[\u3041-\u3096]|[\u30A0-\u30FF]/, // katakana and hiragana only
  REGEX_ENGLISH: /[a-zA-Z]+/,

  // function applies new class to all elements that contain text at first child node
  tagTextElems(nodeSelector) {
    // loop through selected nodes and tag ones that contain text
    $(nodeSelector).each(function(){
      // if element does not have text-elem class and contains unnested text
      const textContent = $( this ).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
      }).text();

      if(!$( this ).hasClass('text-elem') && textContent.length !== 0) {
      // if(!$( this ).hasClass('text-elem') && this.childNodes[0] && this.childNodes[0].nodeValue && this.childNodes[0].nodeValue.trim().length !== 0) {
        // apply text-elem class
        $( this ).addClass('text-elem')
      }
    })
  },

  // function applies new class to all elements with text-elem class and match selected language
  tagLangElems(nodeSelector, language) {
    // loop through nodes labeled as text that are a child of nodeSelector and apply language specific class
    $(nodeSelector).each(function(){
      const textContent = $( this ).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
      }).text();
        // if element does not have language-elem class and unnested text is of the correct language
      if($( this ).hasClass('text-elem') &&
       !$( this ).hasClass(`${language}-elem`) && 
       hanzisizeUtil.hasLanguage(language, textContent)) 
      {
        // apply language-elem class
        $( this ).addClass(`${language}-elem`)
      } else {
        if(test_mode) {console.log(`case 1: element does not contain ${language} text`)}
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
  resizeElems(nodeSelector, language, _singleElemResizer, newMinFontSize) {
    const queryString = `${nodeSelector} .${language}-elem`;
    $(queryString).each(function() {
      _singleElemResizer(this, newMinFontSize)
    })
  },

  // input window, single element and NewMinFS, function will assess OFS, NMFS, CFS & perform proper resizing procedure
  //case 1: element does not contain ${language} text (getLangText function)
  //case 2: CurrentFS is original. No change
  //case 3: CurrentFS is not original and larger than NewMinFS. FS set to OriginalFS
  //case 4: CurrentFS is not original and less than or equal to NewMinFS. FS to NewMinFS
  //case 5: No OriginalFS. Save CurrentFS as OriginalFS. Set FS to NewMinFS
  //case 6: OriginalFS && (CurrentFS < NMFS), Set FS to NewMinFS
  singleElemResizer(el, newMinFontSize) {
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
  main(language, minFontSize, mode, nodeSelector) {
    if(test_mode) console.log(`initiating main function...`);

    if(mode === 'initial') {
      hanzisizeUtil.tagTextElems('body *');
      hanzisizeUtil.tagLangElems('body *', language);
    } else if(mode === 'lang-change') {
      hanzisizeUtil.tagLangElems('body *', language);
    } else if(mode === 'mutation') {
      hanzisizeUtil.tagTextElems(nodeSelector);
      hanzisizeUtil.tagLangElems(nodeSelector, language);
    }

    if (minFontSize) {
      try {
        if(mode === 'initial' || mode === 'lang-change') {
          hanzisizeUtil.resizeElems('body', language, hanzisizeUtil.singleElemResizer, minFontSize)
        } else if (mode === 'mutation') {
          hanzisizeUtil.resizeElems(nodeSelector, language, hanzisizeUtil.singleElemResizer, minFontSize)
        }
      }
      catch(err) {console.log(`Hanzisize failed: ${err}`)}
    }
  }
}

// add listener for message from extension popup
// this fails during testing, so we wrap it in a try catch block
try {
  chrome.runtime.onMessage.addListener(
    function(obj, sender, sendResponse) {
      mostRecentSettings = obj;
      sendResponse({received: "yes"});
      if (test_mode) {console.log('object received by contentScript:' + JSON.stringify(obj) + 'Resizing now...')}

      // call resizing function with object properties received from popup
      hanzisizeUtil.main(obj.language, obj.newMinFontSize, obj.mode)
  });

  // add mutation observer to fire new DOM scan if new element nodes have been added. This fixes the problem of the user having to manuall resize dynamically loaded content.
  // Select the node that will be observed for mutations
  const targetNode = document.documentElement || document.body;

  // Options for the observer (which mutations to observe)
  const config = {childList: true, subtree: true};

  // Callback function to execute when mutations are observed
  const callback = function(mutationsList, observer) {
    console.log('mutation observer triggered')
    const obj = mostRecentSettings;
    // the below works but is pretty ineffiecient. Better solution should exist. should at least wrap in 'if(mutation.addedNodes)'
    hanzisizeUtil.main(obj.language, obj.newMinFontSize, 'mutation', 'body *')

      // maybe add parent node of each mutation to an array, remove non-uniques, and send each array item through .main?
      // Use traditional 'for loops' for IE 11
    // for(let mutation of mutationsList) {
    //   // for(let node of mutation.addedNodes) {
    //     hanzisizeUtil.main(obj.language,obj.newMinFontSize, 'mutation', mutation.addedNodes)
      // }
      // if(mutation.addedNodes.length) {
    //     // somehow get a querySelector out of this mutation object?? 
        // let nodesArray = [];
    //     mutation.addedNodes[0].classList.forEach(element => {
    //       nodeSelector = nodeSelector.concat('.' + element)
    //     });
    //     // --> getElementsByClassName()
        // console.log('mutation observer - nodes have been added')
    //     hanzisizeUtil.main(obj.language, obj.newMinFontSize, 'mutation', nodeSelector)
      // }
    // }
  };
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}
catch(err) {if(test_mode) {console.log(err)}}

try { module.exports = hanzisizeUtil}
catch(err) {if(test_mode) {console.log(err + ".  'module' only necessary for testing purposes. Not needed in production.")}}