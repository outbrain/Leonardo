import * as React from 'react';
import './StatesActionBar.less';
import {StatesContext} from '../../../context/StatesContext';
import {useContext} from 'react';

export function StatesActionBar({setFilter}) {
  const statesContext = useContext(StatesContext);
  const toggleActivateAll = (statesContext, isActive) => {
    statesContext.setStatesActive(isActive);
  };

  return (
    <div className="states-action-bar">
      <div className="search-container">
        <input placeholder="Search..." onKeyUp={(e: any) => setFilter(e.target.value)}/>
      </div>
      <div className="btn" onClick={() => toggleActivateAll(statesContext, true)}>Enable All</div>
      <div className="btn" onClick={() => toggleActivateAll(statesContext, false)}>Disable All</div>
    </div>
  );
}
