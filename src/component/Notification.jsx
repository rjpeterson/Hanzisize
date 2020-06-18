import React from 'react';
import './Notification.css';

class Notification extends React.Component {
  renderNotification() {
    if (!this.props.validFontSize) {
      return 'Please enter a positive integer'
    } else {
      return 'Current Saved Font Size: ' + this.props.minFontSize
    }
  }

  render() {
    return (
      <div className="grid-box notification">
        <p>{this.renderNotification()}</p>
    </div>
    )
  }
}

export default Notification;