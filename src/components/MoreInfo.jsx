import React from 'react';
import './MoreInfo.css';

class MoreInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active: false
    }
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const currentState = this.state.active;
    this.setState({ active: !currentState });
  }

  render() {
    return (
      <div className="more-info-container">
        <div className="show-more" onClick={this.handleClick}>&lt;Show More Info&gt;</div>
        <div className={this.state.active ? 'active info': 'inactive info'}>
          content about copyright, donating, etc etc goes here
        </div>
      </div>
    )
  }
}

export default MoreInfo;