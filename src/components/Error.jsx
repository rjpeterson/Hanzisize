import React from 'react';
import './Error.css';

class Error extends React.Component {
  render() {
    return (
      <div className="error grid-box">
        <div className="box-content error-content">
          {this.props.errorMessage}
        </div>
      </div>
    )
  }
}

export default Error;