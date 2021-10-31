import * as React from 'react';
import './State.less';
import {StatesContext } from '../../../context/StatesContext';
import {useContext, useState} from 'react';
import {Toggle} from '../../common/Toggle/Toggle';
import {Slider} from '../../Slider/Slider';
import {OptionEdit} from '../OptionEdit/OptionEdit';

export function State({state}) {
  const statesContext = useContext(StatesContext);
  const [editOpen, setEditOpen] = useState(false);
  const activeOptionName = state.activeOption ? state.activeOption.name : '';
  const editClicked = e => {
    e.preventDefault();
    setEditOpen(true);
  };

  const onEditClosed = (result) => {
    setEditOpen(false);
    if (!result.canceled) {
      statesContext.addOrUpdateState(result.data);
    }
  };
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
        <a href="#" className="state-edit-icon" onClick={editClicked}> </a>
      </div>
      <div className="state-options">
        <select onChange={e => statesContext.setStateOption(state, e.target.value)}
                value={activeOptionName}>
          {state.options.map(opt => (<option key={state.name + opt.name} value={opt.name}>{opt.name}</option>))}
        </select>
      </div>
      {editOpen && <Slider onClose={onEditClosed}>
                     <OptionEdit state={state} />
                   </Slider>
      }
    </div>
  )
}
