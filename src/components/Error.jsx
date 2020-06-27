import React from 'react';
import './Error.css';

class Error extends React.Component {
  render() {
    return (
      <div className="error grid-box">
        <section className="box-content" id="error-content"></section>
      </div>
    )
  }
}

export default Error;