import React from 'react';
import NumericInput from 'react-numeric-input';
// https://www.npmjs.com/package/react-numeric-input
import './MinFontSize.css'

const customStyles = {
  wrap: {
    width: '80%',
    background: '#E2E2E2',
    boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
    padding: '.1rem .1rem .1rem .1rem',
    borderRadius: '.3rem .3rem .3rem .3rem',
    fontSize: 15
  },
  input: {
    borderRadius: '.1rem .05rem .1rem .05rem',
    color: '#988869',
    border: '1px solid #ccc',
    display: 'block',
    fontWeight: 70,
    textShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)',
    margin: 'auto',
    width: '100%',
    padding: '.2rem 3.4ex .2rem 3.4ex'
  },
  'input:focus' : {
    border: '1px inset #69C',
    outline: 'none'
  }
}

class MinFontSize extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(valueAsNumber) {
    if(valueAsNumber > 0) {
      this.props.changeHandler(true, valueAsNumber)
    } else {
      this.props.changeHandler(false, valueAsNumber);
    }
  }

  render() {
    return (
      <div className="mfs-input grid-box">
        <NumericInput
        className="react-numeric-input-container"
        mobile={true}
        size={3}
        min={1}
        defaultValue={this.props.minFontSize}
        style={customStyles}
        onChange={valueAsNumber => {this.handleChange(valueAsNumber)}}
        />
      </div>
    )
  }
}

export default MinFontSize;