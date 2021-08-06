import { StoredData } from "../types";

const testingTools = {
  devMode: () => {
    if (
      chrome &&
      chrome.runtime &&
      typeof chrome.runtime.getManifest !== "undefined"
    ) {
      // update_url is set by chrome webstore on submit. If it doesn't exist, the extension was loaded locally rather than installed from webstore
      return !("update_url" in chrome.runtime.getManifest());
    } else {
      return false;
    }
  },

  devLog: (str: string) => {
    if (testingTools.devMode()) {
      console.log(str);
    }
  },
};

let mostRecentSettings: StoredData;

const hanzisizeUtil = {
  multipleFrames: false,

  // combined Chinese/Japanese
  REGEX_CN_JP:
    /[\u{3000}-\u{303F}]|[\u{3040}-\u{309F}]|[\u{30A0}-\u{30FF}]|[\u{FF00}-\u{FFEF}]|[\u{4E00}-\u{9FAF}]|[\u{2605}-\u{2606}]|[\u{2190}-\u{2195}]|\u{203B}/u,
  REGEX_CHINESE:
    /[\u{4e00}-\u{9fff}]|[\u{3400}-\u{4dbf}]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\u{f900}-\u{faff}]|[\u{3300}-\u{33ff}]|[\u{fe30}-\u{fe4f}]|[\u{f900}-\u{faff}]|[\u{2f800}-\u{2fa1f}]/u,
  REGEX_JAPANESE: /[\u3041-\u3096]|[\u30A0-\u30FF]/, // katakana and hiragana only
  REGEX_ENGLISH: /[a-zA-Z]+/,
  REGEX_HANGUL:
    /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/,
  // REGEX_HANGUL: /[\u3131-\uD79D]/,
  // REGEX_HANGUL: /\p{Script=Hangul}+/u,
  REGEX_THAI: /[\u0E00-\u0E7F]/,
  // REGEX_THAI: /\p{Script=Thai}+/u,
  REGEX_ARABIC:
    /[\u0600-\u06FF]|[\u0750-\u077F]|[\u08a0-\u08ff]|[\uFB50-\uFDFF]|[\uFE70-\uFEFF]/,
  // REGEX_ARABIC: /\p{Script=Arabic}+/u,
  REGEX_HEBREW: /[\u0590-\u05FF]|[\uFB1D-\uFB4F]/,
  // REGEX_HEBREW: /\p{Script=Hebrew}+/u,
  REGEX_GEORGIAN: /[\u10A0-\u10FF]/,
  // REGEX_GEORGIAN: /\p{Script=Georgian}+/u,
  REGEX_HINDI: /[\u0900-\u097F]/,
  REGEX_BURMESE: /[\u1000-\u109F]/,

  // activeTab api doesn't allow injection into iframes. This function checks for existence of iframes
  frameCheck() {
    const frames = document.getElementsByTagName("iframe");
    if (frames.length >= 1) {
      return true;
    } else {
      return false;
    }
  },

  // apply new class to elements that contain a text_node
  tagTextElems(nodeSelector: string) {
    // loop through selected nodes and tag ones that contain text
    $(nodeSelector).each(function () {
      if (this.tagName !== "SCRIPT") {
        // skip script tags
        // get content of TEXT_NODE
        const textContent = $(this)
          .contents()
          .filter(function () {
            return this.nodeType == Node.TEXT_NODE;
          })
          .text()
          .trim();

        // find nodes that have unnested text and dont already have text-elem class
        if (!$(this).hasClass("text-elem") && textContent.length !== 0) {
          // apply text-elem class
          $(this).addClass("text-elem");
        }
      }
    });
  },

  // apply new class to all elements with text-elem class and TEXT_NODE content matches the selected language
  tagLangElems(nodeSelector: string, language: string) {
    // loop through text-elem nodes that are a child of nodeSelector and apply language specific class
    $(nodeSelector).each(function () {
      // get content of TEXT_NODE
      const textContent = $(this)
        .contents()
        .filter(function () {
          return this.nodeType == Node.TEXT_NODE;
        })
        .text();

      // if element has class text-elem, does not have class {language}-elem, and content of TEXT_NODE is of the correct language
      if (
        $(this).hasClass("text-elem") &&
        !$(this).hasClass(`${language}-elem`) &&
        hanzisizeUtil.hasLanguage(language, textContent)
      ) {
        // apply corresponding {language}-elem class
        $(this).addClass(`${language}-elem`);
      } else {
        testingTools.devLog(`case 1: element does not contain ${language} text`);
      }
    });
  },

  // Error & function handling for language selection
  hasLanguage(lang: string, str: string) {
    let result;
    switch (lang) {
      case "chinese":
        result = hanzisizeUtil.REGEX_CHINESE.test(str);
        break;
      case "english":
        result = hanzisizeUtil.REGEX_ENGLISH.test(str);
        break;
      case "japanese":
        result = hanzisizeUtil.REGEX_CN_JP.test(str);
        break;
      case "hangul":
        result = hanzisizeUtil.REGEX_HANGUL.test(str);
        break;
      case "thai":
        result = hanzisizeUtil.REGEX_THAI.test(str);
        break;
      case "arabic":
        result = hanzisizeUtil.REGEX_ARABIC.test(str);
        break;
      case "hebrew":
        result = hanzisizeUtil.REGEX_HEBREW.test(str);
        break;
      case "georgian":
        result = hanzisizeUtil.REGEX_GEORGIAN.test(str);
        break;
      case "hindi":
        result = hanzisizeUtil.REGEX_HINDI.test(str);
        break;
      case "burmese":
        result = hanzisizeUtil.REGEX_BURMESE.test(str);
        break;
      default:
        throw new Error("Invalid language was provided");
    }
    return result;
  },

  // call singleElemeResizer on each child of {nodeSelector} that has class {language}-elem
  cycleThroughElems(
    nodeSelector: string,
    language: string,
    _singleElemResizer: Function,
    minFontSize: number
  ) {
    // build query string
    const queryString = `${nodeSelector} .${language}-elem`;

    // loop through all elems with singleElemResizer callback func
    $(queryString).each(function () {
      _singleElemResizer(this, minFontSize);
    });
  },

  // function takes single element and NewMinFS, function will assess Original Font Size (OFS), New Minimum Font Size (NMFS), and Current Font Size (CFS) & then perform proper Font Size (FS) resizing procedure according to the six cases below
  //case 1: element does not contain {language} text. No change to FS (returned by getLangText function)
  //case 2: OFS does not exist. CFS > NMFS. No change to FS
  //case 3: OFS exists and > NMFS. Set FS to OFS
  //case 4: OFS exists and <= NMFS. Set FS to NMFS
  //case 5: OFS does not exist. CFS < NMFS Save CFS as OFS. Set FS to NMFS
  //case 6: OFS exists && CFS < NMFS, Set FS to NMFS
  singleElemResizer(el: HTMLElement, minFontSize: number) {
    const currentFontSize = parseInt(
      window.getComputedStyle(el, null).getPropertyValue("font-size")
    );
    const originalFontSize = parseInt(
      window
        .getComputedStyle(el, null)
        .getPropertyValue("--data-original-font-size")
    );

    if (currentFontSize === minFontSize) {
      testingTools.devLog("CFS equals NMFS. no change");
    } else if (currentFontSize > minFontSize) {
      // from big to small
      testingTools.devLog(`CurentFS is larger than NewMinFS`);

      if (!originalFontSize) {
        testingTools.devLog(`case 2: CurrentFS is intial. No change`);
        return;
      } else if (originalFontSize > minFontSize) {
        testingTools.devLog(
            `case 3: CurrentFS is not intial and originalFS is larger than NewMinFS. FS set to OriginalFS`
          );

        el.style.setProperty("font-size", originalFontSize + "px", "important");
        hanzisizeUtil.adjustLineHeight(el, originalFontSize);
      } else {
        testingTools.devLog(
            `case 4: CurrentFS is not initial and less than or equal to NewMinFS. FS to NewMinFS`
          );

        el.style.setProperty("font-size", minFontSize + "px", "important");
        hanzisizeUtil.adjustLineHeight(el, minFontSize);
      }
    } else {
      // CFS < NMFS   from small to big
      testingTools.devLog(`CFS is less than NMFS`);

      if (!originalFontSize) {
        testingTools.devLog(
            `case 5: No OriginalFS. Save CurrentFS as OriginalFS. Set FS to NewMinFS`
          );

        el.style.setProperty(
          "--data-original-font-size",
          currentFontSize + "px"
        );
        el.style.setProperty("font-size", minFontSize + "px", "important");
        hanzisizeUtil.adjustLineHeight(el, minFontSize);
      } else {
        testingTools.devLog(
            `case 6: OriginalFS && (CurrentFS < NMFS), Set FS to NewMinFS`
          );

        el.style.setProperty("font-size", minFontSize + "px", "important");
        hanzisizeUtil.adjustLineHeight(el, minFontSize);
      }
    }
  },

  // This function is borrowed from APlus Font Size Changer
  // Version 1.3.0 - Adjust line-height for websites like nytimes.com
  adjustLineHeight(el: HTMLElement, elFontSize: number) {
    const currentLineHeight = window
      .getComputedStyle(el, null)
      .getPropertyValue("line-height");

    // if line height is too small for new text size, set line height to "normal"
    if (
      currentLineHeight !== "normal" &&
      parseInt(currentLineHeight) <= elFontSize + 1
    ) {
      el.style.setProperty("line-height", "normal", "important");
    }
  },

  // primary function for extension
  main(
    language: string,
    minFontSize: number,
    mode: string,
    nodeSelector?: string
  ) {
    testingTools.devLog(`initiating main function...`);

    // first tag DOM elements
    if (mode === "initial") {
      // initial resize call requires full tagging of text and lang elements
      hanzisizeUtil.multipleFrames = hanzisizeUtil.frameCheck();
      hanzisizeUtil.tagTextElems("body *");
      hanzisizeUtil.tagLangElems("body *", language);
    } else if (mode === "lang-change") {
      // resize call after language change only requires tagging lang elements
      hanzisizeUtil.tagLangElems("body *", language);
    } else if (mode === "mutation" && nodeSelector) {
      // resize call after dynamic content is loaded
      hanzisizeUtil.multipleFrames = hanzisizeUtil.frameCheck();
      hanzisizeUtil.tagTextElems(nodeSelector);
      hanzisizeUtil.tagLangElems(nodeSelector, language);
    }

    // if (minFontSize) {
    try {
      if (mode === "mutation" && nodeSelector) {
        // if mutation mode, only resize elements nested inside {nodeSelector}
        hanzisizeUtil.cycleThroughElems(
          nodeSelector,
          language,
          hanzisizeUtil.singleElemResizer,
          minFontSize
        );
      } else {
        // otherwise, scan and resize the full html body
        hanzisizeUtil.cycleThroughElems(
          "body",
          language,
          hanzisizeUtil.singleElemResizer,
          minFontSize
        );
      }
    } catch (err) {
      testingTools.devLog(`Hanzisize failed: ${err}`);
    }
    // }
  },
};

// add listener for message sent by extension popup
// this fails during testing, so we wrap it in a try-catch block
try {
  chrome.runtime.onMessage.addListener(function (obj, sender, sendResponse) {
    // save object sent from popup
    mostRecentSettings = obj;
    testingTools.devLog(
        "object received by contentScript:" +
          JSON.stringify(obj) +
          "Resizing now..."
      );

    // call resizing function with object properties received from popup
    hanzisizeUtil.main(obj.language, obj.minFontSize, obj.mode);
    // tell popup if multiple frames are present
    sendResponse({
      received: true,
      multipleFrames: hanzisizeUtil.multipleFrames,
    });
  });

  // add mutation observer to fire new DOM scan if new element nodes have been added. This fixes the problem of the user having to manually resize everytime new content is dynamically loaded.
  // current implementation is to rescan entire DOM
  // should modify in the future to only scan newly loaded content
  // Select the node that will be observed for mutations
  const targetNode = document.documentElement || document.body;

  // Options for the observer (which mutations to observe)
  const config = { childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const mutationCallback: MutationCallback = function (
    mutationsList,
    observer
  ) {
    testingTools.devLog("mutation observer triggered");
    const obj = mostRecentSettings;
    // the below works but is pretty ineffiecient. Better solution should exist. should at least wrap in 'if(mutation.addedNodes)'
    hanzisizeUtil.main(obj.language, obj.minFontSize, "mutation", "body *");

    // maybe add parent node of each mutation to an array, remove non-uniques, and send each array item through .main?
    // Use traditional 'for loops' for IE 11
    // for(let mutation of mutationsList) {
    //   // for(let node of mutation.addedNodes) {
    //     hanzisizeUtil.main(obj.language,obj.minFontSize, 'mutation', mutation.addedNodes)
    // }
    // if(mutation.addedNodes.length) {
    //     // somehow get a querySelector out of this mutation object??
    // let nodesArray = [];
    //     mutation.addedNodes[0].classList.forEach(element => {
    //       nodeSelector = nodeSelector.concat('.' + element)
    //     });
    //     // --> getElementsByClassName()
    // testingTools.devLog('mutation observer - nodes have been added')
    //     hanzisizeUtil.main(obj.language, obj.minFontSize, 'mutation', nodeSelector)
    // }
    // }
  };
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(mutationCallback);
  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
} catch (err) {
  testingTools.devLog(err);
}

try {
  module.exports = hanzisizeUtil;
} catch (err) {
  testingTools.devLog(
      err +
        ".  'module' only necessary for testing purposes. Not needed in production."
    );
}
