import * as React from 'react';
import './RecorderActionBar.less';

export function RecorderActionBar({setFilter}) {

  return (
    <div className="recorder-action-bar">
      <div className="recorder-search-container">
        <input placeholder="Search..." onKeyUp={(e: any) => setFilter(e.target.value)}/>
      </div>
    </div>
  );
}
