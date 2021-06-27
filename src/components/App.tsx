/*global chrome*/
import React, { useState, useEffect } from 'react';
// import tools from '../logic/chromeTools';
// import onAppMount from '../logic/onAppMount';
import Upper from './Upper/Upper';
import Lower from './Lower/Lower';
import ErrorMessage from './ErrorMessage';
import testingTools from '../utils/testingTools';
import { ContentResponse, ValidityCheck, TabInfo, StoredData } from '../../types';


import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import theme from './theme';
import 'fontsource-roboto';

testingTools.setupTestEnv();

const useStyles = makeStyles({
  container: {
    width: 340,
    backgroundColor: theme.palette.secondary.main,
    overflow: 'hidden',
    flexDirection: 'row',
  }
})

function App() {
  const classes = useStyles();

  const [minFontSize, setMinFontSize] = useState<StoredData["minFontSize"]>(0);
  const [language, setLanguage] = useState<StoredData["language"]>('chinese');
  // const [tabId, setTabId] = useState<TabInfo["tabId"]>(0);
  const [iFrames, setiFrames] = useState<ContentResponse["multipleFrames"]>(false);
  const [errorMessage, setErrorMessage] = useState<ValidityCheck["message"]>('');

  useEffect(() => {

    // const fetchStoredData = async () => {
    //   const result = await tools.getFromStorage();
    //   testingTools.devLog(`app.useEffect fetched stored data: ${JSON.stringify(result)}`);
    //   return result;
    // }

    // const fetchTabInfo = async () => {
    //   const result = await onAppMount.main()
    //   testingTools.devLog(`app.useEffect fetched tab info: ${JSON.stringify(result)}`);
    //   return result;
    // }
    
    // const checkTabValidity = (tabInfo) => {
    //   let newErrorMessage;
    //   if (!tabInfo.validBrowser || tabInfo.invalidUrl) {
    //     newErrorMessage = tabInfo.invalidUrl || 'user browser unknown. unable to check for valid urls';
    //     setErrorMessage(newErrorMessage);
    //     return false
    //   } else {
    //     return true
    //   }
    // }

    // const createContentObj = (storedData) => {
    //   const contentObj = {
    //     'language': storedData.language,
    //     'newMinFontSize': storedData.minFontSize,
    //     'mode': 'initial',
    //   };
    //   testingTools.devLog(`creating content object: ${JSON.stringify(contentObj)}`)
    //   return contentObj;
    // }

    // const handleInfo = (tabInfo, storedData) => {
    //   const contentObj = createContentObj(storedData);
    //   const validTab = checkTabValidity(tabInfo);

    //   if(!validTab) {return}

    //   testingTools.devLog(`useEffect sending content obj: ${JSON.stringify(contentObj)}`)

    //   tools.sendToContent(tabInfo.tabId, contentObj, (injectionErr, response) => {
    //       setErrorMessage(injectionErr);
    //       setTabId(tabInfo.tabId);
    //       setiFrames(response.multipleFrames);
    //   })
    // }

    const main = () => {

      testingTools.devLog('sending "get stored data" message to background.js')

      chrome.runtime.sendMessage({message: "get stored data"}, ((response: StoredData) => {

        testingTools.devLog(`app.js received storedData: ${JSON.stringify(response)} from background.js`)

        const storedMinFontSize = response.minFontSize;
        const storedLanguage = response.language;
        setMinFontSize(storedMinFontSize);
        setLanguage(storedLanguage);

        // send content object to background.js
        testingTools.devLog('sending "popup opened" message to background.js')
        chrome.runtime.sendMessage({
          message: "popup opened",
          data: {
            minFontSize: storedMinFontSize,
            language: storedLanguage
          }
        }, ((response) => {
          if(response) {
            // disply any url invalid or injection error messages received
            if (response.invalidUrlMessage || response.injectionError) {
              setErrorMessage(response.invalidUrlMessage || response.injectionError)
            } else {
              // display iframe warning
              setiFrames(response.multipleFrames)
              // setTabId(response.tabId)
            }
          }
        }))
      }))
    }

    main();
  }, [])
  
  // fire resizing when user selects a new language from dropdown
  const handleLangChange = (newLanguage: string) => {
    // const newLanguage = newLanguageObj.value;
    // first store new language
    testingTools.devLog('pushing new language to storage')
    // send lang object to background.js
    chrome.runtime.sendMessage({message: 'handle lang change', language: newLanguage}, (response) => {
      testingTools.devLog(`handleLangChange: ${JSON.stringify(response)}`)
    })
    // try{tools.pushLangToStorage(newLanguage)} 
    // catch(err) {console.log(`app.handleLangChange Could not push to storage: ${err}`)}

    // const contentObj = {
    //   'language' : newLanguage,
    //   'newMinFontSize': minFontSize,
    //   'mode': 'lang-change'
    // };
    // testingTools.devLog(`handleLangChange sending content obj: ${JSON.stringify(contentObj)}`)
    // // then send to content script
    // try{tools.sendToContent(tabId, contentObj)}
    // catch(err) {console.log(`app.handleLangChange Could not send to content script: ${err} tabId: ${tabId} contentObj: ${JSON.stringify(contentObj)}`)}

    // chrome.runtime.sendMessage({
    //   message: "lang-change",
    //   data: {
    //     minFontSize: minFontSize,
    //     language: newLanguage
    //   }
    // })

    // finally update state
    setLanguage(newLanguage)
  }

  // fire resizing when user inputs a new minimum font size
  const handleFSChange = (minFontSize: number) => {
    // first store new minfontsize
    testingTools.devLog('pushing new font size to storage')
    chrome.runtime.sendMessage({message: 'handle font size change', minFontSize: minFontSize}, (response) => {
      testingTools.devLog(`handleFSChange: ${JSON.stringify(response)}`)
    })
    // try{tools.pushFSToStorage(newMinFontSize)}//background script listens for this change, and activates content script
    // catch(err) {console.log(`app.handleFSChange Could not push to storage: ${err}`)}

    // const contentObj = {
    //   'language' : language,
    //   'newMinFontSize': newMinFontSize,
    //   'mode': 'fontsize-change'
    // };
    // testingTools.devLog(`handleFSChange sending content obj: ${JSON.stringify(contentObj)}`)
    // // then send to content script
    // try{tools.sendToContent(tabId, contentObj)}
    // catch(err) {console.log(`app.handleLangChange Could not send to content script: ${err} tabId: ${tabId} contentObj: ${JSON.stringify(contentObj)}`)}
    // chrome.runtime.sendMessage({
    //   message: "fontsize-change",
    //   data: {
    //     minFontSize: newMinFontSize,
    //     language: language
    //   }
    // })

    // finally update state
    setMinFontSize(minFontSize)
  }

  // display any error messages recieved
  if(errorMessage) {
    testingTools.devLog('display error message')
    return (<ErrorMessage errorMessage={errorMessage} />)
  }   
  // display active interface
  else {
    testingTools.devLog('display active interface')
    return (
      <ThemeProvider theme={theme}>
        <Container 
          className={classes.container} 
          disableGutters 
          fixed={true} 
          maxWidth="xs"
        >
          <div className="App">
            <Upper 
              language={language}
              changeHandler={handleLangChange}
            />
            <Lower 
              minFontSize={minFontSize}
              changeHandler={handleFSChange}
              iFrames={iFrames}
            />
          </div>
        </Container>
      </ThemeProvider>
    );
  }
}

export default App;
