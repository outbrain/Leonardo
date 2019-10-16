import * as React from 'react';
import './MainContent.less';
import {MenuContext} from '../../context/MenuContext';
import {StatesTab} from '../states/StatesTab/StatesTab';
import {useContext} from 'react';
import {ExportTab} from '../ExportTab/ExportTab';
import {RecorderTab} from '../recorder/RecorderTab/RecorderTab';

export function MainContent() {
  const menuContext = useContext(MenuContext);
  const renderContent = tab => {
    if (tab === 'states') {
      return <StatesTab/>;
    }
    if (tab === 'recorder') {
      return <RecorderTab />;
    }
    return <ExportTab />
  };

  return (
    <div className="main-content">
      {renderContent(menuContext.tab)}
    </div>
  );
}
