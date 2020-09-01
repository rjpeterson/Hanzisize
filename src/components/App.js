/*global chrome*/

import React from 'react';
import logo from '../logo.png';
import './App.css';

import LanguageInput from './LanguageInput';
import MinFontSize from './MinFontSize';
import MoreInfo from './MoreInfo';
import Error from './Error';

import tools from '../logic/chromeTools';
import onAppMount from '../logic/onAppMount';

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
function isDevMode() {
  return !('update_url' in chrome.runtime.getManifest());
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabId: null,
      language: null,
      minFontSize: 0,
      seeMore: false,
      ready: false,
      errorMessage: 'Please input a positive integer',
      loading: 'Loading...'
    };
    
    this.handleFSChange = this.handleFSChange.bind(this);
    this.handleLangChange = this.handleLangChange.bind(this);
    this.handleMoreInfoClick = this.handleMoreInfoClick.bind(this);
  }

  componentDidMount() {
    // react run build compiles and compresses everything into one line of code which makes debugging difficult so console.log is the best way I know to debug the popup at the moment
    if (isDevMode()) console.log(" app.js 37 PRODUCTION MODE popup.js loaded...");

    // retrieve stored language and minfontsize values from chrome storage if they exist
    tools.getFromStorage((storedObject) => {
      if (isDevMode()) console.log(`app.componenetDidMount storedObject: ${JSON.stringify(storedObject)}`)

      // get and validate active tab info
      onAppMount.main((tabId, urlValidityMessage) => {
        if (isDevMode()) console.log(`app.componenetDidMount tabId: ${tabId}`)

        if (urlValidityMessage !== 'valid URL') {
          this.setState({loading: urlValidityMessage})
        } else {
          // first time loading extension fontsize & language wont have stored values
          // if null we submit default values in order for content script to inject properly
          const contentObj = {
            'language' : ('language' in storedObject) ? storedObject.language : 'chinese',
            'newMinFontSize': ('minFontSize' in storedObject) ? storedObject.minFontSize : 0,
            'mode': 'initial'
          };
          
          // inject content script on initial click of browser action or send content object if already injected
          try{
            tools.sendToContent(tabId, contentObj); // errors might be thrown here

            this.setState({
              language : contentObj.language,
              minFontSize: contentObj.newMinFontSize,
              tabId: tabId,
              ready: true
            }, () => {
              if (isDevMode()) console.log(`app.componenetDidMount state: ${JSON.stringify(this.state)}`)
            });
          }
          catch(err) {
            this.setState({
              loading: `cannot load extension on this page ${err}`
            })
          }
        }
      });
    })
  }

  handleLangChange(language) {
    // first store new language
    try{tools.pushLangToStorage(language)}
    catch(err) {console.log(`Could not push to storage: ${err}`)}

    const contentObj = {
      'language' : language,
      'newMinFontSize': this.state.minFontSize,
      'mode': 'lang-change'
    };
    // then send to content script
    try{tools.sendToContent(this.state.tabId, contentObj)}
    catch(err) {console.log(`Could not send to content script: ${err}`)}

    this.setState({language: language}, () => {
      console.log('current state: ' + JSON.stringify(this.state));
    })
  }

  handleFSChange(valid, minFontSize) {
    // validity is determined by component
    if (valid) {
      // first store new minfontsize
      try{tools.pushFSToStorage(minFontSize)}
      catch(err) {console.log(`Could not push to storage: ${err}`)}

      const contentObj = {
        'language' : this.state.language,
        'newMinFontSize': minFontSize,
        'mode': 'fontsize-change'
      };
      // then send to content script
      try{tools.sendToContent(this.state.tabId, contentObj)}
      catch(err) {console.log(`Could not send to content script: ${err}`)}

      this.setState({
        minFontSize: minFontSize,
        errorMessage: ''
      }, () => {
        console.log('current state: ' + JSON.stringify(this.state))
      });
    } else { // if fontsize is invalid
      this.setState({
        errorMessage: 'Please input a positive integer'
    })
    }
  }

  // toggle more-info section display
  handleMoreInfoClick() {
    const currentState = this.state.seeMore;
    this.setState({ seeMore: !currentState });
  }

  // this function is used in snapshot testing only
  readyup() {
    this.setState({ ready: true })
  }

  render() {
    // show loading page until response from chrome.tabs.query is receieved
    if(this.state.ready !== true) {
      return (<div className="loading">{this.state.loading}</div>)
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
        <Error 
        errorMessage={this.state.errorMessage}
        seeMore={this.state.seeMore}
        />
        <MoreInfo 
        clickHandler={this.handleMoreInfoClick}
        seeMore={this.state.seeMore}/>      
      </div>
    )
  };
}

export default App;
