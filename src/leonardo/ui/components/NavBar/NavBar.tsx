import * as React from 'react';
import './NavBar.less';
import {MenuContext} from '../../context/MenuContext';
import {useContext} from 'react';

export function NavBar() {
  const menuContext = useContext(MenuContext);

  function renderItem(item) {
    const className = 'navBar-item' + (menuContext.tab === item ? ' navBar-item-active' : '');
    return (
      <li key={item} className={className} onClick={() => menuContext.setTab(item)}>{item}</li>
    )
  }

  return (
    (<div className="navBar-container">
      <ul className="navBar-list">
        {menuContext.tabs.map(item => renderItem(item))}
      </ul>
    </div>)
  );
}


