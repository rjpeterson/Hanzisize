import React from 'react';
import './Error.css';

class Error extends React.Component {
  render() {
    return (
      <div className="error grid-box">
        <p className="box-content" id="error-content">{this.props.message}</p>
      </div>
    )
  }
}

export default Error;