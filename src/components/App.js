// eslint-disable-next-line no-unused-vars
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
      // validFontSize: false,
      minFontSize: 0,
      errorMessage: 'Please input a positive integer',
      tabId: null,
      ready: false,
      loading: 'Loading...',
      seeMore: false
    };
    
    this.handleFSChange = this.handleFSChange.bind(this);
    this.handleLangChange = this.handleLangChange.bind(this);
    this.handleMoreInfoClick = this.handleMoreInfoClick.bind(this);
  }

  componentDidMount() {
    if (isDevMode()) console.log(" app.js 37 PRODUCTION MODE popup.js loaded...");

    tools.getFromStorage((storedObject) => {
      if (isDevMode()) console.log(`app.componenetDidMount storedObject: ${JSON.stringify(storedObject)}`)

      onAppMount.main((tabId, urlValidityMessage) => {
        if (isDevMode()) console.log(`app.componenetDidMount tabId: ${tabId}`)

        if (urlValidityMessage !== 'valid URL') {
          this.setState({loading: urlValidityMessage})
        } else {
          // first time loading extension = no set fontsize or language
          // so we submit default values in order for content script to inject properly
          const contentObj = {
            'language' : ('language' in storedObject) ? storedObject.language : 'Chinese',
            'newMinFontSize': ('minFontSize' in storedObject) ? storedObject.minFontSize : 0,
            'mode': 'initial'
          };
          
          // if(Number.isInteger(storedObject.minFontSize)) {
          //   this.setState({validFontSize:true});
          // }
          try{tools.sendToContent(tabId, contentObj)}
          catch(err) {console.log(`app componentDidMount Could not send to content script: ${err}`)}

          this.setState({
            language : ('language' in storedObject) ? storedObject.language : 'Chinese',
            minFontSize: ('minFontSize' in storedObject) ? storedObject.minFontSize : 0,
            tabId: tabId,
            ready: true
          }, () => {
            if (isDevMode()) console.log(`app.componenetDidMount state: ${JSON.stringify(this.state)}`)
          });
        }
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
        // validFontSize: true,
        errorMessage: ''
      }, () => {
        console.log('current state: ' + JSON.stringify(this.state))
      });
    } else {
      this.setState({
        // validFontSize: false,
        errorMessage: 'Please input a positive integer'
    })
    }
  }

  handleMoreInfoClick() {
    const currentState = this.state.seeMore;
    this.setState({ seeMore: !currentState });
  }

  render() {
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
