import * as React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {NavBar} from '../NavBar/NavBar'
import './Header.less';

interface HeaderProps {

}

class Header extends React.Component<any, any> {

  render() {
    return (
      <div className="header-container">
        <span className="header-label">LEONARDO</span>
        <NavBar></NavBar>
      </div>
    );
  }
}

export default connect()(Header);