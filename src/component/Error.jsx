import React from 'react';
import './Error.css';

class Error extends React.Component {
  render() {
    return (
      <div className="grid-box error">
        <section class="box-content" id="error-content"></section>
      </div>
    )
  }
}

export default Error;