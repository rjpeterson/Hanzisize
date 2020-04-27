console.log("popup.js loaded...");
const newFontSizeInput = $('#min-font-size');
const savedFontSize = $('#curr-saved-font-size');
const errorMessage = $('#error-message');

// function to push submitted fontsize to chrome local storage
const pushToStorage = async (newMinFontSize) => {
  await chrome.storage.local.set({minFontSize: newMinFontSize}, () => {
    console.log(`New minimum font size stored as: ${newMinFontSize}`)
  })
}

// function to retrieve min font size from chrome local storage
const getFromStorage = async (callback) => {
  await chrome.storage.local.get('minFontSize', (result) => {
    console.log(`Retrieved min font size from storage: ${result.minFontSize}`)
    callback(result.minFontSize);
  })
}

$('#submit').on('click', async () => {
  // validate input as positive number
  const newFontSize = Number(newFontSizeInput.val());
  if (newFontSize <= 0) {
    errorMessage.html('Font Size must be a positive number')
    return;
  }

  // error logging & storing in chrome storage
  console.log(`submitted font size: ${newFontSize}...`);
  try {pushToStorage(newFontSize)}
  catch(err) {console.log(`Failed to store new font size. ${err}`)};

  // get saved value and fill to $curr-saved-font-size html element
  const display = (value) => {
    console.log(`result: ${value}`)
    savedFontSize.html(value)
  };
  try {
    getFromStorage(display);
  } catch(err) {
    console.log(`Failed to retrieve new font size from storage. ${err}`)
  }

   // reset form values
   newFontSizeInput.val('');
   errorMessage.html('');
});