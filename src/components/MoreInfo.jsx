import React from 'react';
import btccode from '../images/btcdonation.jpeg'
import bmac from '../images/bmc-new-btn-logo.svg'
import './MoreInfo.css';

class MoreInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showbtc: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.showbtccode = this.showbtccode.bind(this);
  }

  handleClick() {
    this.props.clickHandler()
  }

  showbtccode() {
    const currentState = this.state.showbtc;
    this.setState({ showbtc: !currentState });
  }

  render() {
    return (
      <div className="more-info-container">
        <div className="show-more" onClick={this.handleClick}>{this.props.seeMore ? 'Go Back': 'Show More Info'}</div>
        <div className={this.props.seeMore ? 'info': 'inactive'}>
          <p>Hi there. I'm Ryan, the developer behind Hanzisize. I've developed this extension and made it available for anyone to use for free. If you appreciate my work, please consider donating so I can continue to improve this tool for all of us.</p>

          <div className="coffee-button">
            <a className="bmc-button" target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/djmouthguard">
              <img src={bmac} alt="Buy me a matcha latte"></img>
              <span>
                Buy me a matcha latte
              </span>
            </a>
          </div>

          <div className="bitcoin-info">
            <p>or donate <span onClick={this.showbtccode}>Bitcoin</span></p>
            <img className={this.state.showbtc ? 'btc-code': 'inactive'} alt="a bitcoin qr code" src={btccode} width="100" height="100"></img>
          </div>
          <p>You can also contribute code or report bugs on <a target="_blank" rel="noopener noreferrer" href="https://github.com/rjpeterson/Hanzisize">Github</a></p>
        </div>
      </div>
    )
  }
}

export default MoreInfo;