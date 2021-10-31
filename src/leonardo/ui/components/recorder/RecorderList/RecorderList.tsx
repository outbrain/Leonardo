import * as React from 'react';
import './RecorderList.less';
import {RecorderActionBar} from '../RecorderActionBar/RecorderActionBar';
import {useContext, useState} from 'react';
import {RecorderItem} from '../RecorderItem/RecorderItem';
import {RecorderContext} from '../../../context/RecorderContext';
import {useInterval} from '../../../hooks/UseInterval';

export function RecorderList() {
  const recorderContext = useContext(RecorderContext);
  const [filter, setFilter] = useState('');

  useInterval(() => {
    recorderContext.refreshLog();
  }, 1000);

  const renderRecord = record => {
    return <RecorderItem key={record.timestamp.getTime() + record.url} record={record}/>
  };

  const filterRecord = record => {
    if (!filter) return true;
    const url = (record.url  || '').toString();
    const verb = record.verb || '';
    const lcFilter = filter.toLowerCase();
    return url.toLowerCase().includes(lcFilter)
      || verb.toLowerCase().includes(lcFilter);
  };

  const clearAll = () => {
    recorderContext.clearAllLogs();
  };

  return (
    <div className="recorder-list-container">
      <RecorderActionBar setFilter={setFilter} clearAll={() => clearAll()}/>
      <div className="recorder-list">
        <div className="recorder-header">
          <div className="recorder-header-verb">Verb</div>
          <div className="recorder-header-url">Request URL</div>
          <div className="recorder-header-response">Response Code</div>
          <div className="recorder-header-is-mocked">Mocked?</div>
          <div className="recorder-header-mock">Mocked State</div>
        </div>
        {recorderContext.log.filter(filterRecord).map(renderRecord)}
      </div>
    </div>
  );
}
