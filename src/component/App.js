/*global chrome*/
import React from 'react';
import logo from '../logo.png';
import tools from '../logic/chromeStorage'
import './App.css';
import LanguageInput from './LanguageInput';
import MinFontSize from './MinFontSize';
import Notification from './Notification';
import Error from './Error';

class App extends React.Component {
  constructor(props) {
    super(props);
    const storedState = tools.getFromStorage();
    if (storedState) {this.state = {minFontSize: storedState}} else {this.state = {minFontSize: null}}
  }
  state = {
    language: null,
    validFontSize: false,
    errorMessage: null
  }

  handleLangChange = language => {
    this.setState({language: language})
  }

  handleFSChange = (valid, minFontSize) => {
    if (valid) {
      this.setState({
        minFontSize: minFontSize,
        validFontSize: true
      });
      tools.pushToStorage(minFontSize);
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
