// function to push submitted fontsize to chrome local storage
const pushToStorage = async (newMinFontSize) => {
  await chrome.storage.local.set({minFontSize: newMinFontSize}, () => {
    console.log(`New minimum font size stored as: ${newMinFontSize}`)
  })
}

// function to retrieve min font size from chrome local storage
const getFromStorage = async (callback, el) => {
  await chrome.storage.local.get('minFontSize', (result) => {
    console.log(`Retrieved min font size from storage: ${result.minFontSize}`)
    if (callback) {
      callback(result.minFontSize, el)
    } else {
      return result.minFontSize
    }
  })
};

// used as callback for chrome storage get to display value in popup
const display = (value, el) => {
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
    getFromStorage(display, savedFontSize);
  } catch(err) {
    console.log(`Failed to retrieve new font size from storage. ${err}`)
  };

  $('#submit').on('click', async () => {
    // validate input as positive number
    const newFontSize = Number(newFontSizeInput.val());
    if (newFontSize <= 0) {
      errorMessage.html('Font Size must be a positive number')
      return;
    }

    // error logging & storing in chrome storage
    console.log(`submitted font size: ${newFontSize}`);
    try {pushToStorage(newFontSize)}
    catch(err) {console.log(`Failed to store new font size. ${err}`)};

    try {
      getFromStorage(display, savedFontSize);
    } catch(err) {
      console.log(`Failed to retrieve new font size from storage. ${err}`)
    };

    try {
      console.log(`should start main function`);
      chrome.tabs.executeScript(null, {file: 'contentScript.js'});
      // main('Chinese', newFontSize)
    } catch(err) {
      console.log(`Failed to resize Chinese text. ${err}`);
    }

    // reset form values
    newFontSizeInput.val('');
    errorMessage.html('');
  })
})