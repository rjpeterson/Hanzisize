console.log("popup.js loaded...");
const newFontSizeInput = $('#min-font-size');
const savedFontSize = $('#curr-saved-font-size');
const errorMessage = $('#error-message');

$('#submit').on('click', () => {
  const newFontSize = Number(newFontSizeInput.val());
  newFontSizeInput.val('');
  errorMessage.html('');

  console.log(`submitted font size: ${newFontSize}...`)
  if (newFontSize <= 0) {
    errorMessage.html('Font Size must be a positive number')
    // return alert("Submitted font size was invalid")
  } else {
    savedFontSize.html(newFontSize)
    // return alert("New font size saved successfully")
  }
});