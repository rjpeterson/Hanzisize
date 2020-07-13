// eslint-disable-next-line no-unused-vars
/*global chrome*/

import React from 'react';
import logo from '../logo.png';
import './App.css';

import LanguageInput from './LanguageInput';
import MinFontSize from './MinFontSize';
import Notification from './Notification';
import Error from './Error';

import tools from '../logic/chromeTools';
import onAppMount from '../logic/onAppMount';

// npm start runs app in browser tab which doesn't have accesse to required chrome apis, so we provide them here for testing the UI
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

function isDevMode() {
  return !('update_url' in chrome.runtime.getManifest());
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      language: null,
      validFontSize: false,
      minFontSize: null,
      errorMessage: null,
      tabId: null,
      ready: false
    };
    
    this.handleFSChange = this.handleFSChange.bind(this);
    this.handleLangChange = this.handleLangChange.bind(this);
  }

  componentDidMount() {
    if (isDevMode()) console.log(" app.js 37 PRODUCTION MODE popup.js loaded...");

    tools.getFromStorage((storedObject) => {
      if (isDevMode()) console.log(`app.componenetDidMount storedObject: ${JSON.stringify(storedObject)}`)

      onAppMount.main((tabId) => {
        if (isDevMode()) console.log(`app.componenetDidMount tabId: ${tabId}`)

        const contentObj = {
          'language' : storedObject.language,
          'newMinFontSize': storedObject.minFontSize,
          'mode': 'initial'
        };
        
        try{tools.sendToContent(tabId, contentObj)}
        catch(err) {console.log(`app componentDidMount Could not send to content script: ${err}`)}

        this.setState({
          minFontSize: storedObject.minFontSize,
          language: storedObject.language,
          tabId: tabId,
          ready: true
        }, () => {
          if (isDevMode()) console.log(`app.componenetDidMount state: ${JSON.stringify(this.state)}`)
        });
        
      });
    })
  }

  handleLangChange(language) {
    try{tools.pushLangToStorage(language)}
    catch(err) {console.log(`Could not push to storage: ${err}`)}

    const contentObj = {
      'language' : language,
      'newMinFontSize': this.state.minFontSize,
      'mode': 'lang-change'
    };
    try{tools.sendToContent(this.state.tabId, contentObj)}
    catch(err) {console.log(`Could not send to content script: ${err}`)}

    this.setState({language: language}, () => {
      console.log('current state: ' + JSON.stringify(this.state));
      // this.setState({errorMessage: ''})
    })
  }

  handleFSChange(valid, minFontSize) {
    if (valid) {
      try{tools.pushFSToStorage(minFontSize)}
      catch(err) {console.log(`Could not push to storage: ${err}`)}

      const contentObj = {
        'language' : this.state.language,
        'newMinFontSize': minFontSize,
        'mode': 'fontsize-change'
      };
      try{tools.sendToContent(this.state.tabId, contentObj)}
      catch(err) {console.log(`Could not send to content script: ${err}`)}

      this.setState({
        minFontSize: minFontSize,
        validFontSize: true,
        errorMessage: ''
      }, () => {
        console.log('current state: ' + JSON.stringify(this.state))
      });
    } else {
      this.setState({
        validFontSize: false,
        errorMessage: 'Invalid font size'
    })
    }
  }

  render() {
    if(this.state.ready !== true) {
      return (<div>Loading...</div>)
    }
    return (
      <div className="App">
        <header className="logo-content grid-box">
          <img className="logo" src={logo} alt="logo" />
        </header>
        <LanguageInput 
        language={this.state.language}
        changeHandler={this.handleLangChange}
        />
        <MinFontSize 
        minFontSize={this.state.minFontSize}
        changeHandler={this.handleFSChange}
        />
        <Notification 
        validFontSize={this.state.validFontSize}
        minFontSize={this.state.minFontSize}
        />
        <Error 
        message={this.errorMessage}
        />      
      </div>
    )
  };
}

export default App;
