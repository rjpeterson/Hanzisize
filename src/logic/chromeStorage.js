/*global chrome*/
const tools = {
  // push submitted fontsize to chrome local storage
  pushToStorage: async (minFontSize) => {
    await chrome.storage.local.set({minFontSize: minFontSize}, () => {
      if (process.env.NODE_ENV ==='test') console.log(`New minimum font size stored as: ${minFontSize}`)
    })
  },

  // retrieve min font size from chrome local storage and display in popup if callback provided
  getFromStorage: async () => {
    await chrome.storage.local.get('minFontSize', (result) => {
      if (process.env.NODE_ENV ==='test') console.log(`Retrieved min font size from storage: ${result.minFontSize}`);
      return result.minFontSize;
    })
  }
}

export default tools;