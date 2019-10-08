import * as React from 'react';
import {NavBar} from '../NavBar/NavBar';
import './Header.less';

export function Header() {
  return (
    <div className="header-container">
      <div className="header-label">LEONARDO</div>
      <NavBar />
    </div>
  );
}
