/*global chrome*/

import React from 'react';
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

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      tabId: null,
      language: null,
      minFontSize: 0,
      ready: false,
      iframes: false,
      initialLoad: true,
      errorMessage: ''
    };
    
    // bind event handlers to App
    this.handleFSChange = this.handleFSChange.bind(this);
    this.handleLangChange = this.handleLangChange.bind(this);
  }

  componentDidMount() {
    // react run build compiles and compresses everything into one line of code so we provide console.log statements for debugging
    if (devLog()) console.log(" app.componentDidMount PRODUCTION MODE popup.js loaded...");

    // retrieve stored language and minfontsize values from chrome storage if they exist
    tools.getFromStorage((storedObject) => {
      if (devLog()) console.log(`app.componenetDidMount storedObject: ${JSON.stringify(storedObject)}`)

      // get and validate active tab info
      onAppMount.main((tabId, urlValidityMessage) => {
        if (devLog()) console.log(`app.componenetDidMount tabId: ${tabId}`)

        // if url is invalid, inform the user why
        if (urlValidityMessage !== 'valid URL' && urlValidityMessage !== 'user browser unknown. unable to check for valid urls') {
          if (devLog()) console.log(`app.componenetDidMount urlValidityMessage: ${urlValidityMessage}`)
          this.setState({ready: false, initialLoad: false, errorMessage: urlValidityMessage})
        } else {
          // if this is the first time loading the extension, fontsize & language wont have stored values
          // so, we submit default values "chinese" and "0" in order for content script to inject properly
          // otherwise, submit values retrieved from storage

          const contentObj = {
            'language' : ('language' in storedObject) ? storedObject.language : 'chinese',
            'newMinFontSize': ('minFontSize' in storedObject) ? storedObject.minFontSize : 0,
            'mode': 'initial'
          };
          if (devLog()) console.log(`app.componenetDidMount contentObj: ${JSON.stringify(contentObj)}`)
        // inject content script on browser action click or send content object if already injected
          tools.sendToContent(tabId, contentObj, (injectionErr, response) => {
            // if browser doesn't allow script injection on current page
            if (injectionErr !== null) {
              // inform user
              console.log(`app caught error: ${injectionErr}`)
              this.setState({
                ready: false,
                initialLoad: false,
                errorMessage: injectionErr
              })
              // if page contains iframes
            } else if (response.multipleFrames) {
              // display warning message
              this.setState({
                language : contentObj.language,
                minFontSize: contentObj.newMinFontSize,
                tabId: tabId,
                ready: true,
                initialLoad: false,
                iframes: true,
                errorMessage: ''
              })
            } else {
              this.setState({
                language : contentObj.language,
                minFontSize: contentObj.newMinFontSize,
                tabId: tabId,
                ready: true,
                initialLoad: false,
                iframes: false,
                errorMessage: ''
              }, () => {
                if (devLog()) console.log(`app.componenetDidMount state: ${JSON.stringify(this.state)}`)
              });
            }
          });
        }
      });
    })
  }

  // fire resizing when user selects a new language from dropdown
  handleLangChange(language) {
    // first store new language
    try{tools.pushLangToStorage(language)}
    catch(err) {console.log(`app.handleLangChange Could not push to storage: ${err}`)}

    const contentObj = {
      'language' : language,
      'newMinFontSize': this.state.minFontSize,
      'mode': 'lang-change'
    };
    // then send to content script
    try{tools.sendToContent(this.state.tabId, contentObj)}
    catch(err) {console.log(`app.handleLangChange Could not send to content script: ${err} tabId: ${this.state.tabId} contentObj: ${JSON.stringify(contentObj)}`)}

    // finally update state
    this.setState({language: language}, () => {
      console.log('app.handleLangChange current state: ' + JSON.stringify(this.state));
    })
  }

  // fire resizing when user inputs a new minimum font size
  handleFSChange(minFontSize) {
    // first store new minfontsize
    try{tools.pushFSToStorage(minFontSize)}
    catch(err) {console.log(`app.handleFSChange Could not push to storage: ${err}`)}

    const contentObj = {
      'language' : this.state.language,
      'newMinFontSize': minFontSize,
      'mode': 'fontsize-change'
    };
    // then send to content script
    try{tools.sendToContent(this.state.tabId, contentObj, (injectionErr, response) => {
      this.setState({
        minFontSize: minFontSize,
        iframes: response.multipleFrames
      }, () => {
        console.log('app.handleFSChange current state: ' + JSON.stringify(this.state))
      });
    })}
    catch(err) {console.log(`app.handleFSChange Could not send to content script: ${err}`)}
  }

  render() {
    // display placeholder interface
    if(!this.state.ready && this.state.initialLoad) {
      if (devLog()) console.log('display placeholder interface')
      return (
        <div class="loading-screen"><img src={spinner} alt="loading..."></img></div>
      )
    }
    // display any error messages recieved
    else if(!this.state.ready && !this.state.initialLoad) {
      if (devLog()) console.log('display error message')
      return (<div className="error-message">{this.state.errorMessage}</div>)
    } 
    // display active interface
    else {
      if (devLog()) {
        console.log('display active interface')
        console.log('current state: ' + JSON.stringify(this.state))
      }
      return (
        <div className='App'>
          <div className="top">
            <img className="logo" src={logo} alt="logo" />
            <LanguageInput 
              language={this.state.language}
              changeHandler={this.handleLangChange}
            />
          </div>
          <div className="bottom">      
            <InputSlider 
              minFontSize={this.state.minFontSize}
              changeHandler={this.handleFSChange}
            />
            <IFrameWarning 
              display={this.state.iframes}
            />
            <MoreInfo />  
          </div>    
        </div>
      )
    }
  };
}

export default App;