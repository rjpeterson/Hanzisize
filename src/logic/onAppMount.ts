export {}
/*global chrome*/

// above needed for testing
// import googlechrome from './browser-specific/googlechrome';
// import firefox from './browser-specific/firefox';
// import opera from './browser-specific/opera';
// import edge from './browser-specific/edge';
// import { TabInfo, GetQueryResult } from '../../types';

// import testingTools from '../utils/testingTools';

// const onAppMount = {

//   // determine user's browser
//   userBrowser:  () => {
//     let result = {
//       valid: false,
//       message: ''
//     }
//     if (firefox.isFirefox() === true) {// user is on firefox
//       result = {valid: true, message: 'firefox'};
//     } else if (opera.isOpera() === true) { // user is on opera
//       result = {valid: true, message: 'opera'};
//     } else if (edge.isEdge() === true) { // user is on edge
//       result = {valid: true, message: 'edge'};
//     } else if (googlechrome.isChrome() === true) { // test googlechrome last because the above browsers' useragent strings also contain the string "Chrome"
//       result = {valid: true, message: 'chrome'};
//     }
//     return result
//   },

//   // check for disallowed urls by browser
//   urlValid: (tab : chrome.tabs.Tab, browser : string) => {
//     let result = {
//       valid: true,
//       message: ''
//     }
//     switch(browser) {
//       case 'firefox':
//         result = firefox.urlValid(tab)
//         break;
//       case 'opera':
//         result = opera.urlValid(tab)
//         break;
//       case 'edge':
//         result = edge.urlValid(tab)
//         break;
//       case 'chrome':
//         result = googlechrome.urlValid(tab);
//         break;
//     }
//     return result;
//   },

//   // gets and validates current tab.id and gets url validity string, sends both to callback
//   main: async () => {

//     // get active tab info
//     const getQueryResult : GetQueryResult = () => {
//       return new Promise(resolve => {
//         chrome.tabs.query({active: true, currentWindow: true}, response => resolve(response))
//       }) 
//     }

//     const tabs : chrome.tabs.Tab[] = await getQueryResult()
//     const tab : chrome.tabs.Tab = tabs[0];

//     testingTools.devLog(`onAppMount.main tab ${JSON.stringify(tab)}`)
//     // tab object validation
//     if(!tab.id) {throw new Error('tab.id not defined')};
//     if(!tab.url) {throw new Error('tab.url not defined')}
    
//     // check browser
//     const browserValid = onAppMount.userBrowser();
//     // check url
//     const urlValid = onAppMount.urlValid(tab, browserValid.message);
//     const result: TabInfo = {
//       tabId: tab.id, 
//       browserValid: browserValid,
//       urlValid: urlValid
//     }
//     return result;
//   }
// }

// export default onAppMount;