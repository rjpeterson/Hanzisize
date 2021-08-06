/*global chrome*/

const testingTools = {
  devMode: () => {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      return true;
    } else if (
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

  devLog: (str) => {
    if (testingTools.devMode()) {
      console.log(str);
    }
  },

  setupTestEnv: () => {
    // npm start runs app in browser tab which doesn't have accesse to required chrome apis, so we provide them here for UI testing purposes
    if (process.env.NODE_ENV === "development") {
      global.chrome = {
        runtime: {
          getManifest: () => {
            return { update_url: true };
          },
        },
        tabs: {
          query: () => {},
          sendMessage: () => {},
        },
        storage: {
          local: {
            get: () => {},
            set: () => {},
          },
        },
      };
    }
  },
};

export default testingTools;
