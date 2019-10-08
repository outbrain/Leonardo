import * as React from 'react';
import './StatesList.less';
import {StatesContext} from '../../../context/StatesContext';
import {State} from '../State/State';
import {StatesActionBar} from '../StatesActionBar/StatesActionBar';
import {useContext, useState} from 'react';

export function StatesList() {
  const statesContext = useContext(StatesContext);
  const [filter, setFilter] = useState('');
  const renderState = state => {
    return <State key={state.name} state={state}/>
  };

  const filterState = state => {
    if (!filter) return true;
    const url = (state.url  || '').toString();
    const verb = state.verb || '';
    const lcFilter = filter.toLowerCase();
    return state.name.toLowerCase().includes(lcFilter)
      || url.toLowerCase().includes(lcFilter)
      || verb.toLowerCase().includes(lcFilter);
  };

  return (
    <div className="states-list-container">
      <StatesActionBar setFilter={setFilter}/>
      <div className="states-list">
        {statesContext.states.filter(filterState).map(renderState)}
      </div>
    </div>
  );
}
