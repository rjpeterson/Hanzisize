import React from 'react';
import Select from 'react-select';
// https://react-select.com/home
import './LanguageInput.css';

const options = [
  {value: 'Chinese', label: 'Chinese'},
  {value: 'English', label: 'English'},
  {value: 'Japanese', label: 'Japanese'}
]

const customStyles = {
  container: (provided, state) => {
    const width = '8rem';
    const height = 30;
    const padding = 2;

    return {...provided, width, height, padding}
  },
  control: (provided, state) => {
    const height = 25;

    return {...provided, height}
  }
}

class LanguageInput extends React.Component {

  handleChange = e => {
      this.props.changeHandler(e.value);
  }

  render() {
    return (
      <div className="language-input grid-box">
        <Select 
        styles={customStyles}
        options={options}
        defaultValue={{value: 'Chinese', label: 'Chinese'}}
        onChange={this.handleChange} 
        />
      </div>
    )
  }
}

export default LanguageInput;