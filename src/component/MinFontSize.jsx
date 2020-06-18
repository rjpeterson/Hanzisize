import React from 'react';
import NumericInput from 'react-numeric-input';
// https://www.npmjs.com/package/react-numeric-input
import './MinFontSize.css'

class MinFontSize extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = e => {
    if(e <= 0) {
      this.props.changeHandler(false,e)
    } else {
      this.props.changeHandler(true, e);
    }
  }

  render() {
    return (
      <div className="grid-box text-size-input">
        <NumericInput
        className="react-numeric-input-container"
        min={1}
        onChange={valueAsNumber => {this.handleChange(valueAsNumber)}}
        />
      </div>
    )
  }
}

export default MinFontSize;