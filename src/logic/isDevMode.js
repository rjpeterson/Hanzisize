/*global chrome*/

function isDevMode() {
  return !('update_url' in chrome.runtime.getManifest());
}

export default isDevMode;