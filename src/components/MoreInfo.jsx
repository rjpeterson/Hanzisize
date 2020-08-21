import React from 'react';
import btccode from '../btcdonation.jpeg'
import './MoreInfo.css';

class MoreInfo extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.clickHandler()
  }

  render() {
    return (
      <div className="more-info-container">
        <div className="show-more" onClick={this.handleClick}>{this.props.seeMore ? '<Go Back>': '<Show More Info>'}</div>
        <div className={this.props.seeMore ? 'info': 'inactive'}>
          <p>Hi there. I'm Ryan, the developer behind Hanzisize. I've developed this extension and made it available for anyone to use for free. If you appreciate my work, please consider donating so I can continue to improve this tool for all of us.</p>

          <div className="coffee-button"><link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet"></link><a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/djmouthguard"><img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Buy me a matcha latte"></img><span style="margin-left:5px;font-size:24px !important;">Buy me a matcha latte</span></a></div>

          <p>or with bitcoin:</p>
          <img alt="a bitcoin qr code" src={btccode} width="100" height="100"></img>
          <p>You can contribute code or report bugs here:</p>
          <p>https://github.com/rjpeterson/Hanzisize</p>
        </div>
      </div>
    )
  }
}

export default MoreInfo;