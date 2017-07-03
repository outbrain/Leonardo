import * as React from 'react';
import {Link} from 'react-router-dom';
import './NavBar.less';

interface NavBarProps {

}

export class NavBar extends React.Component<any, any> {

  render() {
    return (
      <div className="navBar-container">
        <ul className="navBar-list">
          <li className="navBar-item"><Link to="/about">scenarios</Link></li>
          <li className="navBar-item"><Link to="/more">recorder</Link></li>
          <li className="navBar-item"><Link to="/more">exported code</Link></li>
        </ul>
      </div>
    );
  }
}