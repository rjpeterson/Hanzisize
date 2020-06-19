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

class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleFSChange = this.handleFSChange.bind(this);
    this.handleLangChange = this.handleLangChange.bind(this);
  }
  state = {
    language: null,
    validFontSize: false,
    minFontSize: null,
    errorMessage: null,
    tabId: null
  }

  componentDidMount = () => {
    if (process.env.NODE_ENV === 'production') console.log(" app.js 32 PRODUCTION MODE popup.js loaded...");

    onAppMount((didMountObject) => {
      if (process.env.NODE_ENV === 'production') console.log(`app.js 35 didMountObject: ${JSON.stringify(didMountObject)}`)
    this.setState({
      minFontSize: didMountObject.minFontSize,
      tabId: didMountObject.tabId
    })
    });
  }

  handleLangChange = language => {
    this.setState({language: language})
  }

  handleFSChange = (valid, minFontSize) => {
    if (valid) {
      this.setState({
        minFontSize: minFontSize,
        validFontSize: true
      }, () => {
        console.log('current state: ' + JSON.stringify(this.state))

        try{tools.pushToStorage(minFontSize)}
        catch(err) {console.log(`Could not push to storage: ${err}`)}

        const contentObj = {
          'language' : this.state.language,
          'newMinFontSize': this.state._minFontSize
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
        <header className="logo-content">
          <img src={logo} className="logo" alt="logo" />
        </header>
        <LanguageInput 
        changeHandler={this.handleLangChange}
        />
        <MinFontSize 
        changeHandler={this.handleFSChange}
        />
        <Notification 
        validFontSize={this.state.validFontSize}
        minFontSize={this.state._minFontSize}
        />
        <Error 
        message={this.errorMessage}
        />      
      </div>
    )
  };
}

export default App;
