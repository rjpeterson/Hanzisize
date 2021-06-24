import React, { useState, useEffect } from 'react';
import tools from '../logic/chromeTools';
import onAppMount from '../logic/onAppMount';
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
  const [tabId, setTabId] = useState<TabInfo["tabId"]>(0);
  const [iFrames, setiFrames] = useState<ContentResponse["multipleFrames"]>(false);
  const [errorMessage, setErrorMessage] = useState<ValidityCheck["message"]>('');

  useEffect(() => {

    const fetchStoredData = async () => {
      const result = await tools.getFromStorage();
      testingTools.devLog(`app.useEffect fetched stored data: ${JSON.stringify(result)}`);
      return result;
    }

    const fetchTabInfo = async () => {
      const result = await onAppMount.main()
      testingTools.devLog(`app.useEffect fetched tab info: ${JSON.stringify(result)}`);
      return result;
    }
    
    const checkTabValidity = (tabInfo: TabInfo) => {
      let newErrorMessage : string = '';
      if (!tabInfo.browserValid.valid || !tabInfo.urlValid.valid) {
        newErrorMessage = tabInfo.urlValid.message || 'user browser unknown. unable to check for valid urls';
        setErrorMessage(newErrorMessage);
        return false
      } else {
        return true
      }
    }

    const createContentObj = (storedData: StoredData) => {
      const contentObj = {
        'language': storedData.language,
        'minFontSize': storedData.minFontSize,
        'mode': 'initial',
      };
      testingTools.devLog(`creating content object: ${JSON.stringify(contentObj)}`)
      return contentObj;
    }

    const handleInfo = (tabInfo: TabInfo, storedData: StoredData) => {
      const contentObj = createContentObj(storedData);
      const validTab = checkTabValidity(tabInfo);

      if(!validTab) {return}

      testingTools.devLog(`useEffect sending content obj: ${JSON.stringify(contentObj)}`)

      tools.sendToContent(tabInfo.tabId, contentObj, (injectionErr: string | undefined, response: ContentResponse) => {
          setErrorMessage(injectionErr);
          setTabId(tabInfo.tabId);
          setiFrames(response.multipleFrames);
      })
    }

    const main = async () => {
      const storedData : StoredData = await fetchStoredData();
      const tabInfo = await fetchTabInfo();

      handleInfo(tabInfo, storedData);
      setMinFontSize(storedData.minFontSize);
      setLanguage(storedData.language);
    }

    main();
  }, [])
  
  // fire resizing when user selects a new language from dropdown
  const handleLangChange = (newLanguage: string) => {
    // const newLanguage = newLanguageObj.value;
    // first store new language
    try{tools.pushLangToStorage(newLanguage)}
    catch(err) {console.log(`app.handleLangChange Could not push to storage: ${err}`)}

    const contentObj = {
      'language' : newLanguage,
      'minFontSize': minFontSize,
      'mode': 'lang-change'
    };
    testingTools.devLog(`handleLangChange sending content obj: ${JSON.stringify(contentObj)}`)
    // then send to content script
    try{tools.sendToContent(tabId, contentObj)}
    catch(err) {console.log(`app.handleLangChange Could not send to content script: ${err} tabId: ${tabId} contentObj: ${JSON.stringify(contentObj)}`)}

    // finally update state
    setLanguage(newLanguage)
  }

  // fire resizing when user inputs a new minimum font size
  const handleFSChange = (minFontSize: number) => {
    // first store new minfontsize
    try{tools.pushFSToStorage(minFontSize)}
    catch(err) {console.log(`app.handleFSChange Could not push to storage: ${err}`)}

    const contentObj = {
      'language' : language,
      'minFontSize': minFontSize,
      'mode': 'fontsize-change'
    };
    testingTools.devLog(`handleFSChange sending content obj: ${JSON.stringify(contentObj)}`)
    // then send to content script
    try{tools.sendToContent(tabId, contentObj)}
    catch(err) {console.log(`app.handleLangChange Could not send to content script: ${err} tabId: ${tabId} contentObj: ${JSON.stringify(contentObj)}`)}

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
