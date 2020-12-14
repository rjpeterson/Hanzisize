/*global chrome*/

import React, { useState, useEffect } from 'react';
import logo from '../images/logo.png';
import spinner from '../images/91.gif';
import './App.css';

import LanguageInput from './LangInput';
import InputSlider from './MinFontSize';
import MoreInfo from './MoreInfo';
import IFrameWarning from './IFrameWarning';

import tools from '../logic/chromeTools';
import onAppMount from '../logic/onAppMount';
import devLog from '../utils/devLog';

// npm start runs app in browser tab which doesn't have accesse to required chrome apis, so we provide them here for UI testing purposes
if(process.env.NODE_ENV === 'development') {
  global.chrome = {
    runtime: {
      getManifest: () => {return {update_url: true}}
    },
    tabs: {
      query: ()=>{}
    },
    storage: {
      local: {
        get: ()=>{},
        set: ()=>{}
      }
    }
  }
}

// update_url is set by chrome webstore on submit. If it doesn't exist, the extension was loaded locally rather than installed from webstore

export default function App() {
  const [minFontSize, setMinFontSize] = useState(0);
  const [language, setLanguage] = useState('chinese');
  const [tabId, setTabId] = useState(null);
  const [ready, setReady] = useState(false);
  const [iFrames, setiFrames] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {

    const fetchStoredData = async () => {
      const result = await tools.getFromStorage();
      devLog(`app.useEffect fetched stored data: ${JSON.stringify(result)}`);
      return result;
    }

    const fetchTabInfo = async () => {
      const result = await onAppMount.main()
      devLog(`app.useEffect fetched tab info: ${JSON.stringify(result)}`);
      return result;
    }
    
    const checkTabValidity = (tabInfo) => {
      let newErrorMessage;
      if (!tabInfo.validBrowser || tabInfo.invalidUrl) {
        newErrorMessage = tabInfo.invalidUrl || 'user browser unknown. unable to check for valid urls';
        setErrorMessage(newErrorMessage);
        return false
      } else {
        return true
      }
    }

    const createContentObj = (storedData) => {
      const contentObj = {
        'language': storedData.language,
        'newMinFontSize': storedData.minFontSize,
        'mode': 'initial',
      };
      devLog(`creating content object: ${JSON.stringify(contentObj)}`)
      return contentObj;
    }

    const handleInfo = (tabInfo, storedData) => {
      const contentObj = createContentObj(storedData);
      const validTab = checkTabValidity(tabInfo);

      if(!validTab) {return}

      devLog(`useEffect sending content obj: ${JSON.stringify(contentObj)}`)

      tools.sendToContent(tabInfo.tabId, contentObj, (injectionErr, response) => {
          setErrorMessage(injectionErr);
          setTabId(tabInfo.tabId);
          setReady(true);
          setiFrames(response.multipleFrames);
      })
    }

    const onMount = async () => {
      const storedData = await fetchStoredData();
      const tabInfo = await fetchTabInfo();

      handleInfo(tabInfo, storedData);
      setMinFontSize(storedData.minFontSize);
      setLanguage(storedData.language);
    }

    onMount();
  }, [])

  // fire resizing when user selects a new language from dropdown
  const handleLangChange = (newLanguage) => {
    // first store new language
    try{tools.pushLangToStorage(newLanguage)}
    catch(err) {console.log(`app.handleLangChange Could not push to storage: ${err}`)}

    const contentObj = {
      'language' : newLanguage,
      'newMinFontSize': minFontSize,
      'mode': 'lang-change'
    };
    devLog(`handleLangChange sending content obj: ${JSON.stringify(contentObj)}`)
    // then send to content script
    try{tools.sendToContent(tabId, contentObj)}
    catch(err) {console.log(`app.handleLangChange Could not send to content script: ${err} tabId: ${tabId} contentObj: ${JSON.stringify(contentObj)}`)}

    // finally update state
    setLanguage(newLanguage)
  }

  // fire resizing when user inputs a new minimum font size
  const handleFSChange = (newMinFontSize) => {
    // first store new minfontsize
    try{tools.pushFSToStorage(newMinFontSize)}
    catch(err) {console.log(`app.handleFSChange Could not push to storage: ${err}`)}

    const contentObj = {
      'language' : language,
      'newMinFontSize': newMinFontSize,
      'mode': 'fontsize-change'
    };
    devLog(`handleFSChange sending content obj: ${JSON.stringify(contentObj)}`)
    // then send to content script
    try{tools.sendToContent(tabId, contentObj)}
    catch(err) {console.log(`app.handleLangChange Could not send to content script: ${err} tabId: ${tabId} contentObj: ${JSON.stringify(contentObj)}`)}

    // finally update state
    setMinFontSize(newMinFontSize)
  }

    // display any error messages recieved
    if(errorMessage) {
      devLog('display error message')
      return (<div className="error-message">{errorMessage}</div>)
    } 
    // display placeholder interface
    else if(!ready) {
      devLog('display placeholder interface')
      return (
        <div class="loading-screen"><img src={spinner} alt="loading..."></img></div>
      )
    }
    
    // display active interface
    else {
      devLog('display active interface')
      // devLog('current state: ' + JSON.stringify(state))
      return (
        <div className='App'>
          <div className="top">
            <img className="logo" src={logo} alt="logo" />
            <LanguageInput 
              language={language}
              changeHandler={handleLangChange}
            />
          </div>
          <div className="bottom">      
            <InputSlider 
              minFontSize={minFontSize}
              changeHandler={handleFSChange}
            />
            <IFrameWarning 
              display={iFrames}
            />
            <MoreInfo />  
          </div>    
        </div>
      )
    }
};