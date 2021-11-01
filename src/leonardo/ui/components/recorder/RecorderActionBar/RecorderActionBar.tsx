import * as React from 'react';
import './RecorderActionBar.less';

export function RecorderActionBar({setFilter, clearAll, toggleRecordingEnabled, recordingEnabled}) {

  return (
    <div className="recorder-action-bar">
      <div className="recorder-search-container">
        <input placeholder="Search..." onKeyUp={(e: any) => setFilter(e.target.value)}/>
      </div>
      <div className="recorder-actions-container">
        <button className="btn" onClick={() => toggleRecordingEnabled()}> { recordingEnabled ? 'Stop' : 'Record'} </button>
        <button className="btn" onClick={() => clearAll()}>Clear All</button>
      </div>
    </div>
  );
}
