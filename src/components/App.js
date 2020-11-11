/*global chrome*/

import React from 'react';
import logo from '../logo.png';
import './App.css';

import LanguageInput from './LanguageInput';
import MinFontSize from './MinFontSize';
import MoreInfo from './MoreInfo';
import Notification from './Notification';

import tools from '../logic/chromeTools';
import onAppMount from '../logic/onAppMount';
import isDevMode from '../logic/isDevMode';

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
      seeMore: false,
      ready: false,
      initialLoad: true,
      notification: '',
      errorMessage: ''
    };
    
    // bind event handlers to App
    this.handleFSChange = this.handleFSChange.bind(this);
    this.handleLangChange = this.handleLangChange.bind(this);
    this.handleMoreInfoClick = this.handleMoreInfoClick.bind(this);
  }

  componentDidMount() {
    // react run build compiles and compresses everything into one line of code so we provide console.log statements for debugging
    if (isDevMode()) console.log(" app.componentDidMount PRODUCTION MODE popup.js loaded...");

    // retrieve stored language and minfontsize values from chrome storage if they exist
    tools.getFromStorage((storedObject) => {
      if (isDevMode()) console.log(`app.componenetDidMount storedObject: ${JSON.stringify(storedObject)}`)

      // get and validate active tab info
      onAppMount.main((tabId, urlValidityMessage) => {
        if (isDevMode()) console.log(`app.componenetDidMount tabId: ${tabId}`)

        // if url is invalid, inform the user why
        if (urlValidityMessage !== 'valid URL' && urlValidityMessage !== 'user browser unknown. unable to check for valid urls') {
          if (isDevMode()) console.log(`app.componenetDidMount urlValidityMessage: ${urlValidityMessage}`)
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
          if (isDevMode()) console.log(`app.componenetDidMount contentObj: ${JSON.stringify(contentObj)}`)
        // inject content script on browser action click or send content object if already injected
          tools.sendToContent(tabId, contentObj, (injectionErr, response) => {
            if (injectionErr !== null) {
              console.log(`app caught error: ${injectionErr}`)
              this.setState({
                ready: false,
                initialLoad: false,
                errorMessage: injectionErr,
                notification: ''
              })
            } else if (response.multipleFrames) {
              this.setState({
                language : contentObj.language,
                minFontSize: contentObj.newMinFontSize,
                tabId: tabId,
                ready: true,
                initialLoad: false,
                notification: "Warning: This page contains iframes. Hanzisize may not work properly.",
                errorMessage: ''
              })
            } else {
              this.setState({
                language : contentObj.language,
                minFontSize: contentObj.newMinFontSize,
                tabId: tabId,
                ready: true,
                initialLoad: false,
                notification: '',
                errorMessage: ''
              }, () => {
                if (isDevMode()) console.log(`app.componenetDidMount state: ${JSON.stringify(this.state)}`)
              });
              this.forceUpdate();
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
    catch(err) {console.log(`app.handleLangChange Could not send to content script: ${err}`)}

    // finally update state
    this.setState({language: language}, () => {
      console.log('app.handleLangChange current state: ' + JSON.stringify(this.state));
    })
  }

  // fire resizing when user inputs a new minimum font size
  handleFSChange(valid, minFontSize) {
    
    // validity is determined by MinFontSize component
    if (valid) {
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
        let newNotification = '';
        if (response.multipleFrames) {newNotification = "Warning: This page contains iframes. Hanzisize may not work properly."}
        this.setState({
          minFontSize: minFontSize,
          notification: newNotification
        }, () => {
          console.log('app.handleFSChange current state: ' + JSON.stringify(this.state))
        });
      })}
      catch(err) {console.log(`app.handleFSChange Could not send to content script: ${err}`)}

      
    } else { // if fontsize is invalid
      this.setState({
        notification: 'Please input a positive integer'
    })
    }
  }

  // toggle more-info section display when use clicks "more info" button
  handleMoreInfoClick() {
    const currentState = this.state.seeMore;
    this.setState({ seeMore: !currentState });
  }

  render() {
    // display placeholder interface
    if(!this.state.ready && this.state.initialLoad) {
      if (isDevMode()) console.log('display placeholder interface')
      return (
        <div className='App'>
          <header className="logo-container grid-box">
            <div className="logo-background">
              <img src={logo} alt="logo" />
            </div>
          </header>
          <LanguageInput 
          language={"chinese"}
          changeHandler={this.handleLangChange}
          seeMore={false}
          />
          <MinFontSize 
          minFontSize={0}
          changeHandler={this.handleFSChange}
          seeMore={false}
          />
          <Notification 
          notification={""}
          seeMore={false}
          />
          <MoreInfo 
          clickHandler={this.handleMoreInfoClick}
          seeMore={false}
          />      
        </div>
      )
    }
    // display any error messages recieved
    else if(!this.state.ready && !this.state.initialLoad) {
      if (isDevMode()) console.log('display error message')
      return (<div className="error-message">{this.state.errorMessage}</div>)
    } 
    // display active interface
    else {
      if (isDevMode()) {
        console.log('display active interface')
        console.log('current state: ' + JSON.stringify(this.state))
      }
      return (
        <div className={this.state.seeMore ? 'see-more': 'App'}>
          <header className="logo-container grid-box">
            <div className="logo-background">
              <img src={logo} alt="logo" />
            </div>
          </header>
          <LanguageInput 
          language={this.state.language}
          changeHandler={this.handleLangChange}
          seeMore={this.state.seeMore}
          />
          <MinFontSize 
          minFontSize={this.state.minFontSize}
          changeHandler={this.handleFSChange}
          seeMore={this.state.seeMore}
          />
          <Notification 
          notification={this.state.notification}
          seeMore={this.state.seeMore}
          />
          <MoreInfo 
          clickHandler={this.handleMoreInfoClick}
          seeMore={this.state.seeMore}
          />      
        </div>
      )
    }
  };
}

export default App;