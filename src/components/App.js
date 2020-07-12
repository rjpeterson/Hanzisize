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
      language: 'Chinese',
      validFontSize: false,
      minFontSize: null,
      errorMessage: null,
      tabId: null
    };
    
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleFSChange = this.handleFSChange.bind(this);
    this.handleLangChange = this.handleLangChange.bind(this);
  }

  componentDidMount() {
    if (isDevMode()) console.log(" app.js 37 PRODUCTION MODE popup.js loaded...");
    debugger;

    tools.getFromStorage((storedFontSize) => {
      if (isDevMode()) console.log(`app.componenetDidMount storedFontSize: ${storedFontSize}`)

      onAppMount.main((tabId) => {
        if (isDevMode()) console.log(`app.componenetDidMount tabId: ${tabId}`)
        this.setState({
          minFontSize: storedFontSize,
          tabId: tabId
        });
  
        const contentObj = {
          'language' : this.state.language,
          'newMinFontSize': this.state.minFontSize,
          'initial': true
        };
        
        try{tools.sendToContent(this.state.tabId, contentObj)}
        catch(err) {console.log(`app.js 48 Could not send to content script: ${err}`)}
      });
    })
  }

  handleLangChange(language) {
    this.setState({language: language}, () => {
      console.log('current state: ' + JSON.stringify(this.state));
      
      const contentObj = {
        'language' : this.state.language,
        'newMinFontSize': this.state.minFontSize,
        'initial': false
      };
      try{tools.sendToContent(this.state.tabId, contentObj)}
      catch(err) {console.log(`Could not send to content script: ${err}`)}

      // this.setState({errorMessage: ''})
    })
  }

  handleFSChange(valid, minFontSize) {
    if (valid) {
      this.setState({
        minFontSize: minFontSize,
        validFontSize: true
      }, () => {
        console.log('current state: ' + JSON.stringify(this.state))

        try{tools.pushFSToStorage(minFontSize)}
        catch(err) {console.log(`Could not push to storage: ${err}`)}

        const contentObj = {
          'language' : this.state.language,
          'newMinFontSize': this.state.minFontSize,
          'initial': false
        };
        try{tools.sendToContent(this.state.tabId, contentObj)}
        catch(err) {console.log(`Could not send to content script: ${err}`)}

        this.setState({errorMessage: ''})
      });
    } else {
      this.setState({validFontSize: false})
    }
  }

  render() {
    return (
      <div className="App">
        <header className="logo-content grid-box">
          <img className="logo" src={logo} alt="logo" />
        </header>
        <LanguageInput 
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
