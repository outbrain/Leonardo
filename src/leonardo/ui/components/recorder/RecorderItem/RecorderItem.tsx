import * as React from 'react';
import './RecorderItem.less';

export function RecorderItem({record}) {
  const url = record.url ? record.url.toString() : '';
  const isMocked = record.state && record.state.active;
  return (
    <div className="recorder-item">
      <div className={"recorder-verb recorder-verb-" + record.verb.toLowerCase()}>{record.verb}</div>
      <div className="recorder-url" title={url}>{url}</div>
      <div className="recorder-response">{record.status}</div>
      <div className="recorder-is-mocked">{isMocked ? 'Yes' : 'No'}</div>
      <div className="recorder-mock">
        { record.state ? <div className="recorder-state">{record.state.name}</div> : <div className="btn recorder-add-state">Add State</div>}
      </div>
    </div>
  )
}
