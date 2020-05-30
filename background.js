//https://developer.chrome.com/extensions/background_pages

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({fontSize: ''}, function() {
    console.log("font-size initialized.");
  });
});

// chrome.runtime.onMessage.addListener(
//   function(message, callback) {
//     if (message == "runContentScript"){
//       chrome.tabs.executeScript({
//         file: 'contentScript.js'
//       });
//     }
//  });
  //chrome.browserAction.setBadgeText(object details, function callback)
  //for setting badge icon to indicate current min font size