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

  // const [state, setState] = useState({
  //   minFontSize: 0,
  //   language: 'chinese',
  //   tabId: null,
  //   ready: false,
  //   iFrames: false,
  //   errorMessage: '',
  // })

  useEffect(() => {

    const fetchStoredData = async () => {
      let result = await tools.getFromStorage();
      devLog(`app.useEffect storedObject: ${JSON.stringify(result)}`);

      setMinFontSize(result.minFontSize);
      setLanguage(result.language);
      // setState({
      //   ...state,
      //   minFontSize: result.minFontSize,
      //   language: result.language,
      // })
    }

    const fetchTabInfo = async () => {
      const result = await onAppMount.main()
      return result;
    }
    
    const checkTabValidity = (tabInfo) => {
      let newErrorMessage;
      if (!tabInfo.validBrowser || tabInfo.invalidUrl) {
        newErrorMessage = tabInfo.invalidUrl || 'user browser unknown. unable to check for valid urls';
        setErrorMessage(newErrorMessage);
        // setState({
        //   ...state,
        //   errorMessage: newErrorMessage
        // });
        return false
      } else {
        return true
      }
    }

    const createContentObj = () => {
      devLog('creating content object...')
      return {
        'language': language,
        'newMinFontSize': minFontSize,
        'mode': 'initial',
      }
    }

    const handleTabInfo = (tabInfo) => {
      const contentObj = createContentObj();
      const validTab = checkTabValidity(tabInfo);

      if(!validTab) {return}

      tools.sendToContent(tabInfo.tabId, contentObj, (injectionErr, response) => {
        if (injectionErr) {
          setErrorMessage(injectionErr);
          // setState({
          //   ...state,
          //   errorMessage: injectionErr,
          // })
        } else {
          setTabId(tabInfo.tabId);
          setReady(true);
          setiFrames(response.multipleFrames);
          // setErrorMessage('');
          // setState({
          //   ...state,
          //   tabId: tabInfo.tabId,
          //   ready: true,
          //   iFrames: response.multipleFrames,
          //   errorMessage: '',
          // })
          // devLog(`app.useEffect state: ${JSON.stringify(state)}`)
        }
      })
    }

    const onMount = async () => {
      await fetchStoredData();
      const tabInfo = await fetchTabInfo();

      devLog(`app.useEffect fetched tab info: ${JSON.stringify(tabInfo)}`);

      handleTabInfo(tabInfo);
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
    // then send to content script
    try{tools.sendToContent(tabId, contentObj)}
    catch(err) {console.log(`app.handleLangChange Could not send to content script: ${err} tabId: ${tabId} contentObj: ${JSON.stringify(contentObj)}`)}

    // finally update state
    setLanguage(newLanguage)
    // setState({
    //   ...state,
    //   language: language
    // })
    // console.log('app.handleLangChange current state: ' + JSON.stringify(state));
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
    // then send to content script
    try{tools.sendToContent(tabId, contentObj, (injectionErr, response) => {
      setMinFontSize(newMinFontSize)
      setiFrames(response.multipleFrames)
      // setState({
      //   ...state,
      //   minFontSize: minFontSize,
      //   iframes: response.multipleFrames
      // })
      // console.log('app.handleFSChange current state: ' + JSON.stringify(state))
    })}
    catch(err) {console.log(`app.handleFSChange Could not send to content script: ${err}`)}
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