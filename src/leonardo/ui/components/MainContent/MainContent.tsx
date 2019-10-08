import * as React from 'react';
import './MainContent.less';
import {MenuContext} from '../../context/MenuContext';
import {StatesTab} from '../states/StatesTab/StatesTab';
import {useContext} from 'react';

export function MainContent() {
  const menuContext = useContext(MenuContext);
  const renderContent = tab => {
    if (tab === 'states') {
      return <StatesTab/>;
    }
    if (tab === 'recorder') {
      return <div>recorder</div>;
    }
    return <div>exported code</div>
  };

  return (
    <div className="main-content">
      {renderContent(menuContext.tab)}
    </div>
  );
}
