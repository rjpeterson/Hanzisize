import React from 'react';
import Select from 'react-select';
// https://react-select.com/home
import './LanguageInput.css';

const options = [
  {value: 'Chinese', label: 'Chinese'},
  {value: 'English', label: 'English'},
  {value: 'Japanese', label: 'Japanese'}
]

class LanguageInput extends React.Component {

  handleChange = e => {
      this.props.changeHandler(e.value);
  }

  render() {
    return (
      <div>
        <Select 
        className="react-select-container"
        classNamePrefix="react-select"
        options={options}
        defaultValue={{value: 'Chinese', label: 'Chinese'}}
        onChange={this.handleChange} />
      </div>
    )
  }
}

export default LanguageInput;