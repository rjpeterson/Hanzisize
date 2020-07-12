import React from 'react';
import Select from 'react-select';
// https://react-select.com/home
import './LanguageInput.css';

const options = [
  {value: 'Chinese', label: '中文 Chinese'},
  {value: 'English', label: 'English'},
  {value: 'Japanese', label: '日本語 Japanese'}
]

const customStyles = {
  container: (provided, state) => {
    const fontSize = '.75rem';
    const width = '8rem';
    const padding = 2;

    return {...provided, fontSize, width, padding}
  },
  control: (provided, state) => {
    const minHeight = '1.5rem';
    const boxShadow = '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000';
    const borderRadius = '.3rem'

    return {...provided, minHeight, boxShadow, borderRadius}
  },
  valueContainer: (provided, state) => {
    const height = '1.5rem';

    return {...provided, height}
  }
}

class LanguageInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = e => {
      this.props.changeHandler(e.value);
  }

  setDefault = () => {
    const match = options.find(element => element.value === this.props.language);
    if (match) {
      return match
    } else {
      return options[0]
    }
  }

  render() {
    return (
      <div className="language-input grid-box">
        <Select 
        styles={customStyles}
        options={options}
        defaultValue={this.setDefault()}
        onChange={this.handleChange} 
        />
      </div>
    )
  }
}

export default LanguageInput;