import * as React from 'react';
import './RecorderActionBar.less';

export function RecorderActionBar({setFilter, clearAll}) {

  return (
    <div className="recorder-action-bar">
      <div className="recorder-search-container">
        <input placeholder="Search..." onKeyUp={(e: any) => setFilter(e.target.value)}/>
      </div>
      <div className="recorder-clear-container">
          <button className="btn" onClick={() => clearAll()}>Clear All</button>
      </div>
    </div>
  );
}
