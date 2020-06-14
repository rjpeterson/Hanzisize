  // FEATURES STILL TO BE BUILT:
  // 1.ON STARTUP, SET SAVED FONT SIZE MESSAGE TO EMPTY
    // a.TIE SAVED VALUE TO TAB ID ???
  // 2.ADD LANGUAGE SELECTION INITIAL OPTION SCREEN
    // a.ADD 'CHANGE LANGUAGE' LINK TO MAIN POPUP MENU
    // b.CHANGE LOGO ACCORDING TO LANGUAGE ???


let tab_id = false;
let test_mode = true;
let min_font_size;
let language;

// accepts object with language and newMinFontSize properties and sends it to content script
function send_to_content(obj) {
	if (test_mode) console.log('tab_id:' + tab_id);

  // try to send object to content script
	chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {
    // if fails to send, inject script and send again
    if (chrome.runtime.lastError) {
      if (test_mode) console.log('ERROR: ' + chrome.runtime.lastError.message);
      // Above gets "ERROR: Could not establish connection. Receiving end does not exist" if you run it on chrome://extensions/ page or if the extension is just installed and the page has not been refreshed
    
      // Inject content.js in active tab. Need "permissions": ["activeTab"] in manifest.json to work
      chrome.tabs.executeScript(tab_id, {file: "contentScript.js"}, function() {
        if (chrome.runtime.lastError) {
          if (test_mode) console.error(chrome.runtime.lastError.message);
        } else {
          setTimeout(function(){ 
            // call send_to_content(obj) again after content.js injected
            send_to_content(obj); 
          }, 200);
        }
      });		
		}
		if (test_mode) console.log(JSON.stringify(response));

  	});
}

// push submitted fontsize to chrome local storage
const pushToStorage = async (newMinFontSize) => {
  await chrome.storage.local.set({minFontSize: newMinFontSize}, () => {
    if (test_mode) console.log(`New minimum font size stored as: ${newMinFontSize}`)
  })
}

// retrieve min font size from chrome local storage and display in popup if callback provided
const getFromStorage = async (callback, el) => {
  await chrome.storage.local.get('minFontSize', (result) => {
    if (test_mode) console.log(`Retrieved min font size from storage: ${result.minFontSize}`)

    min_font_size = result.minFontSize
    if (callback) {
      try { callback(min_font_size, el) }
      catch(err) {
        console.log(`Failed to retrieve new font size from storage. ${err}`)
      }
    }
  })
};

// used as callback for getFromStorage to display value in popup
const display = (value, el) => {
  el.html(value)
};

// get current tab information and produce error for pages that dont permit extensions
chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
  var tab = tabs[0];
  // get current tab id
  tab_id = tab.id;

  if(test_mode) console.log(tab.url);
  
	if(tab.url.match(/^chrome/i)) {
		document.getElementById('error-content').innerHTML = "NOTE: Google blocks extensions and does not allow them to work on special <b>chrome://</b> pages such as the current page.";
  } else if (tab.url.match(/\/webstore/i)) {
    document.getElementById('error-content').innerHTML = "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.";
  }
});

$(document).ready(() => {
  if (test_mode) console.log("popup.js loaded...");
  const languageInput = $('#language');
  const newFontSizeInput = $('#min-font-size');
  const savedFontSize = $('#curr-saved-font-size');
  const errorMessage = $('#error-message');
  const notificationLabel = $('#notification-label');

  // If chrome storage is empty, don't display notification
  getFromStorage((min_font_size) => {
    console.log('testing......' + min_font_size)
    if(!Number.isInteger(min_font_size)) {
      notificationLabel.css("visibility", "hidden");
    } else {
      display(min_font_size, savedFontSize)
    }
  });

    // If there is a font size saved in storage, display value
  // getFromStorage(display, savedFontSize);

  newFontSizeInput.on('change paste keyup', async () => {
    language = languageInput.val();
    const newFontSize = newFontSizeInput.val();
    
    // validate input as positive number
    if (newFontSize && newFontSize <= 0) {
      errorMessage.html('Please input a positive number')
      return;
    }
    min_font_size = newFontSize;

    // error logging & storing in chrome storage
    if(test_mode) console.log(`submitted font size: ${newFontSize}`);
    try {pushToStorage(newFontSize)}
    catch(err) {console.log(`Failed to store new font size. ${err}`)};
    // retrieve font size just stored and deisplay in popup
    getFromStorage(display, savedFontSize);

    try {
      let obj = {
        'language' : language,
        'newMinFontSize': min_font_size
      };
      if(test_mode) console.log('sending obj to content script:' + JSON.stringify(obj));
      send_to_content(obj);
    } catch(err) {
      if(test_mode) console.log(`Failed build and send content script object. ${err}`);
    }

    // reset form input values
    //newFontSizeInput.val('');
    notificationLabel.css("visibility", "visible")
    errorMessage.html('');
  })
})