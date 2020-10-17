import React from 'react';
import './Notification.css';

class Notification extends React.Component {
  render() {
    return (
      <div className={this.props.seeMore ? 'inactive' : 'notification grid-box'}>
        <div className="notification-content">
          {this.props.notification}
        </div>
      </div>
    )
  }
}

export default Notification;