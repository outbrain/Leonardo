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
          <li className="navBar-item"><NavLink replace activeClassName="navBar-item-active" to="/states">states</NavLink></li>
          <li className="navBar-item"><NavLink replace activeClassName="navBar-item-active" to="/recorder">recorder</NavLink></li>
          <li className="navBar-item"><NavLink replace activeClassName="navBar-item-active" to="/export">exported code</NavLink></li>
        </ul>
      </div>
    );
  }
}