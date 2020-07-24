import React from 'react';
import './Error.css';

class Error extends React.Component {
  render() {
    return (
      <div className={this.props.seeMore ? 'inactive' : 'error grid-box'}>
        <div className="box-content error-content">
          {this.props.errorMessage}
        </div>
      </div>
    )
  }
}

export default Error;