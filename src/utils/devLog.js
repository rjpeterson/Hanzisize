/*global chrome*/

// update_url is set by chrome webstore on submit. If it doesn't exist, the extension was loaded locally rather than installed from webstore
function devLog(str) {
  let devMode;
  if(process.env.NODE_ENV === "test") {
    devMode = true
  }
  else {
    devMode = !('update_url' in chrome.runtime.getManifest());
  }  
  if(devMode) {console.log(str)} 
}

export default devLog;