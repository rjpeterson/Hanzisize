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
      <div className="notification grid-box">
        <p className="notification-content">{this.renderNotification()}</p>
    </div>
    )
  }
}

export default Notification;