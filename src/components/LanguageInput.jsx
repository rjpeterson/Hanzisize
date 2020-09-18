import React from 'react';
import Tooltip from '@atlaskit/tooltip';
import Select, { components } from 'react-select';
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
const selectOptions = [
  {value: 'arabic', label: 'العربية', tooltip: 'Arabic'},
  {value: 'burmese', label: 'မြန်မာဘာသာ', tooltip: 'Burmese'},
  {value: 'chinese', label: '中文', tooltip: 'Chinese'},
  {value: 'english', label: 'English', tooltip: '(Any Roman alphabet)'},
  {value: 'georgian', label: 'ქართული', tooltip: 'Georgian'},
  {value: 'hangul', label: '한국어', tooltip: 'Korean'},
  {value: 'hebrew', label: 'עברית', tooltip: 'Hebrew'},
  {value: 'hindi', label: 'हिन्दी', tooltip: 'Hindi'},
  {value: 'japanese', label: '日本語', tooltip: 'Japanese'},
  {value: 'thai', label: 'ไทย', tooltip: 'Thai'}
]

// displays english tooltip on option hover
const Option = props => {
  return (
    <Tooltip content={
      selectOptions.find(element => element.value === props.value).tooltip
      }>
      <components.Option {...props} />
    </Tooltip>
  );
};

const customStyles = {
  container: (provided) => {
    const fontSize = '.75rem';
    const width = '8rem';
    const padding = '.15rem';

    return {...provided, fontSize, width, padding}
  },
  control: (provided) => {
    const minHeight = '1.5rem';
    const boxShadow = '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000';
    const borderRadius = '.3rem';

    return {...provided, minHeight, boxShadow, borderRadius}
  },
  valueContainer: (provided) => {
    const height = '1.5rem';

    return {...provided, height}
  },
  menu: (provided) => {
    const marginTop = '0px';
    const width = '7.7rem';
    const overflowY = 'auto';

    return {...provided, marginTop, width, overflowY}
  },
  option: (provided) => {
    const padding = '4px 12px';

    return {...provided, padding}
  }
}

class LanguageInput extends React.Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = e => {
      this.props.changeHandler(e.value);
  }

  setDefault = () => {
    const match = selectOptions.find(element => element.value === this.props.language);
    if (match) {
      return match
    } else {
      return selectOptions[1]
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
        components={{ Option }}
        styles={customStyles}
        options={selectOptions}
        maxMenuHeight='6.5rem'
        defaultValue={this.setDefault()}
        onChange={this.handleChange} 
        />
      </div>
    )
  }
}

export default LanguageInput;