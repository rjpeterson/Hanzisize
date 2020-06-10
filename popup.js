let tab_id = false;
let test_mode = true;
let minFontSize;

chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
	var tab = tabs[0];
  tab_id = tab.id;

	if (test_mode) console.log(tab.url); // Version 1.3.0
	if (tab.url.match(/^chrome/i))
		document.getElementById('error').innerHTML = "NOTE: Google blocks extenstions and does not allow them to work on special <b>chrome://</b> pages such as the current page.";
    else if (tab.url.match(/\/webstore/i))	
		document.getElementById('error').innerHTML = "NOTE: For this extension to work you must leave the Chrome Webstore and go to another website. Google blocks extensions from functioning on special Google pages such as the Chrome Webstore.";
});

function send_to_content(obj)
{
	if (test_mode) console.log('tab_id:' + tab_id);
	//console.log(JSON.stringify(obj));
	// Version 1.2.5 - Added {frameId: 0} to sendMessage only to the main frame in the tab
	chrome.tabs.sendMessage(tab_id, obj, {frameId: 0}, function(response) {
    	 
    	if (chrome.runtime.lastError) 
    	{
            console.log('ERROR: ' + chrome.runtime.lastError.message);
        /* Above gets "ERROR: Could not establish connection. Receiving end does not exist"
			if you run it on chrome://extensions/ page or if the extension is just installed
			and the page has not been refreshed */
			//if (chrome.runtime.lastError.match(/Receiving end does not exist/i))
			//	document.getElementById('error').innerHTML = "NOTE: You must refresh the web page before this extension will work on it!";
		
			/*  Inject content.js in active tab.
					Need "permissions": ["activeTab"] in manifest.json for this to work
			*/
			 	chrome.tabs.executeScript(tab_id, {file: "contentScript.js"}, function() {
    				if (chrome.runtime.lastError) {
        				console.error(chrome.runtime.lastError.message);
    				}
    				else
    				{
    					setTimeout(function(){ 
							send_to_content(obj); // Then call send_to_content(obj) again after content.js injected
						}, 200);
    				}
    			});		
		}
		console.log(JSON.stringify(response));

  	});
  	//tab_id = false;
}

// function to push submitted fontsize to chrome local storage
const pushToStorage = async (newMinFontSize) => {
  await chrome.storage.local.set({minFontSize: newMinFontSize}, () => {
    console.log(`New minimum font size stored as: ${newMinFontSize}`)
  })
}

// function to retrieve min font size from chrome local storage
const getFromStorage = async (el, callback) => {
  await chrome.storage.local.get('minFontSize', (result) => {
    console.log(`Retrieved min font size from storage: ${result.minFontSize}`)
    minFontSize = result.minFontSize
    if (callback) {
      callback(el, minFontSize)
    }
  })
};

// used as callback for chrome storage get to display value in popup
const display = (el, value) => {
  // console.log(`result: ${value}`)
  el.html(value)
};

$(document).ready(() => {
  console.log("popup.js loaded...");
  const newFontSizeInput = $('#min-font-size');
  const savedFontSize = $('#curr-saved-font-size');
  const errorMessage = $('#error-message');

  // Initial filling of value if present
  try {
    getFromStorage(savedFontSize, display);
  } catch(err) {
    console.log(`Failed to retrieve new font size from storage. ${err}`)
  };

  $('#submit').on('click', async () => {
    // validate input as positive number
    const newFontSize = Number(newFontSizeInput.val());
    minFontSize = newFontSize;
    if (newFontSize <= 0) {
      errorMessage.html('Font Size must be a positive number')
      return;
    }

    // error logging & storing in chrome storage
    console.log(`submitted font size: ${newFontSize}`);
    try {pushToStorage(newFontSize)}
    catch(err) {console.log(`Failed to store new font size. ${err}`)};

    try {
      getFromStorage(savedFontSize, display);
    } catch(err) {
      console.log(`Failed to retrieve new font size from storage. ${err}`)
    };

    try {
      console.log(`should start main function`);
      let obj = {
        'language' : 'Chinese',
        'newMinFontSize': minFontSize
      };
      console.log('sending obj to content script:' + JSON.stringify(obj));
      send_to_content(obj);
      // chrome.tabs.executeScript(null, { 
      //   // set variables for font resizing function
      //   code: `let language = 'Chinese'; let newMinFontSize = ${getFromStorage()}`
      // }, function() {
      //   // call font resizing function
      //   chrome.tabs.executeScript(null, {file: 'contentScript.js'});
      // });
    } catch(err) {
      console.log(`Failed to resize Chinese text. ${err}`);
    }

    // reset form values
    newFontSizeInput.val('');
    errorMessage.html('');
  })
})