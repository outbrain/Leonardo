import * as React from 'react';
import './State.less';
import * as ToggleButton from 'react-toggle-button'
import {StatesContext } from '../../../context/StatesContext';
import {useContext} from 'react';

export function State({state}) {
  const statesContext = useContext(StatesContext);
  const activeOptionName = state.activeOption ? state.activeOption.name : '';
  const activeOption = state.options.find(opt => opt.value === activeOptionName);
  console.log(state.name, state.activeOption)
  return (
    <div className="state-row">
      <div className="state-active">
        <ToggleButton
          value={!!state.active}
          inactiveLabel=''
          activeLabel=''
          colors={{
            inactive: {
              base: '#cbcace'
            }
          }}
          onToggle={(value) => {
            statesContext.activateState(state, !value)
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
          {state.options.map(opt => (<option key={opt.name} value={opt.name}>{opt.name}</option>))}
        </select>
      </div>
    </div>
  )
}
