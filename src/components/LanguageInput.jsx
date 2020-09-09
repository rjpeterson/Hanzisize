import React from 'react';
import Select from 'react-select';
// https://react-select.com/home
import './LanguageInput.css';

// const options = [
//   {value: 'arabic', label: 'العربيةArabic'},
//   {value: 'chinese', label: '中文Chinese'},
//   {value: 'english', label: 'English'},
//   {value: 'georgian', label: 'ქართულიGeorgian'},
//   {value: 'hangul', label: '한국어Hangul'},
//   {value: 'hebrew', label: 'עבריתHebrew'},
//   {value: 'japanese', label: '日本語Japanese'},
//   {value: 'thai', label: 'ไทยThai'}
// ]
const options = [
  {value: 'arabic', label: 'العربية'},
  {value: 'chinese', label: '中文'},
  {value: 'english', label: 'English'},
  {value: 'georgian', label: 'ქართული'},
  {value: 'hangul', label: '한국어'},
  {value: 'hebrew', label: 'עברית'},
  {value: 'hindi', label: 'हिन्दी'},
  {value: 'japanese', label: '日本語'},
  {value: 'thai', label: 'ไทย'}
]

const customStyles = {
  container: (provided, state) => {
    const fontSize = '.75rem';
    const width = '8rem';
    const padding = '.15rem';

    return {...provided, fontSize, width, padding}
  },
  control: (provided, state) => {
    const minHeight = '1.5rem';
    const boxShadow = '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000';
    const borderRadius = '.3rem';

    return {...provided, minHeight, boxShadow, borderRadius}
  },
  valueContainer: (provided, state) => {
    const height = '1.5rem';

    return {...provided, height}
  },
  menu: (provided, state) => {
    const marginTop = '0px';
    const width = '7.7rem';
    const overflowY = 'auto';

    return {...provided, marginTop, width, overflowY}
  },
  option: (provided, state) => {
    const padding = '4px 12px';

    return {...provided, padding}
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
      return options[1]
    }
  }

  render() {
    return (
      <div className={this.props.seeMore ? 'inactive' : 'language-input grid-box'}>
        <label className="input-label" htmlFor="langinput">Select a language to resize</label>
        <Select 
        // menuIsOpen="true"
        classNamePrefix="language-input"
        id="langinput"
        styles={customStyles}
        options={options}
        maxMenuHeight='6.5rem'
        defaultValue={this.setDefault()}
        onChange={this.handleChange} 
        />
      </div>
    )
  }
}

export default LanguageInput;