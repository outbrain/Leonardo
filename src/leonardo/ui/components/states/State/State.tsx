import * as React from 'react';
import './State.less';
import {StatesContext } from '../../../context/StatesContext';
import {useContext} from 'react';
import {Toggle} from '../../common/Toggle/Toggle';

export function State({state}) {
  const statesContext = useContext(StatesContext);
  const activeOptionName = state.activeOption ? state.activeOption.name : '';
  return (
    <div className="state-row">
      <div className="state-active">
        <Toggle
          value={state.active}
          onToggle={(value) => {
            statesContext.activateState(state, value)
          }}/>
      </div>
      <div className={"state-verb state-verb-" + state.verb.toLowerCase()}>{state.verb}</div>
      <div className="state-text">
        <div className="state-name">{state.name}</div>
        <div className="state-url">{state.url ? state.url.toString() : ''}</div>
      </div>
      <div className="state-options">
        <select onChange={e => statesContext.setStateOption(state, e.target.value)}
                value={activeOptionName}>
          {state.options.map(opt => (<option key={state.name + opt.name} value={opt.name}>{opt.name}</option>))}
        </select>
      </div>
    </div>
  )
}
