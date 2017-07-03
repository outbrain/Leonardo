import * as React from 'react';
import {NavLink} from 'react-router-dom';
import './NavBar.less';

interface NavBarProps {

}

export class NavBar extends React.Component<any, any> {

  render() {
    return (
      <div className="navBar-container">
        <ul className="navBar-list">
          <NavLink className="navBar-item" to="/about">states</NavLink>
          <NavLink className="navBar-item" to="/more">recorder</NavLink>
          <NavLink className="navBar-item" to="/more">exported code</NavLink>
        </ul>
      </div>
    );
  }
}