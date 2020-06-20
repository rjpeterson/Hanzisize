import React from 'react';
import NumericInput from 'react-numeric-input';
// https://www.npmjs.com/package/react-numeric-input
import './MinFontSize.css'

const customStyles = {
  wrap: {
    width: '80%',
    background: '#E2E2E2',
    boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
    padding: '2px',
    borderRadius: '3px',
    fontSize: 15
  },
  input: {
      borderRadius: '4px 2px 2px 4px',
      color: '#988869',
      padding: '0.1ex 1ex',
      border: '1px solid #ccc',
      display: 'block',
      fontWeight: 70,
      textShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)'
  },
  'input:focus' : {
      border: '1px inset #69C',
      outline: 'none'
  },
  'input-container': {
      width: '100%'
  }
}

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
      <div className="mfs-input grid-box">
        <NumericInput
        className="react-numeric-input-container"
        mobile={true}
        size={3}
        min={1}
        style={customStyles}
        onChange={valueAsNumber => {this.handleChange(valueAsNumber)}}
        />
      </div>
    )
  }
}

export default MinFontSize;