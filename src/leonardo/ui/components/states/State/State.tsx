import * as React from 'react';
import './State.less';
import {StatesContext } from '../../../context/StatesContext';
import {useContext, useState} from 'react';
import {Toggle} from '../../common/Toggle/Toggle';
import {Slider} from '../../Slider/Slider';
import {OptionEdit} from '../OptionEdit/OptionEdit';
import { Button, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { IState } from "../../../../configuration.srv";

export function State({state}) {
  const OptionSelect = Select.ofType<IState>();
  const statesContext = useContext(StatesContext);
  const [editOpen, setEditOpen] = useState(false);
  const { activeOption } = state
  const activeOptionName = activeOption?.name || '';
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

  const filterOptions = (val, item) => {
      if(!val) {
          return true
      }

      const lcName = item.name.toLowerCase()
      return lcName.includes(val.toLowerCase());
  };

  const itemRenderer = (item, { handleClick, modifiers }): JSX.Element => {
    return (
      <MenuItem
          active={modifiers.active}
          key={state.name + item.name}
          onClick={handleClick}
          text={item.name}
          title={item.name}
      />)
  }

  const onItemSelect = (e) => {
      statesContext.setStateOption(state, e.name)
  }

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
        <OptionSelect
          items={state.options}
          itemRenderer={itemRenderer}
          activeItem={activeOption}
          itemPredicate={filterOptions}
          onItemSelect={onItemSelect}
        >
          <Button text={activeOptionName} rightIcon="caret-down" />
        </OptionSelect>
      </div>
      {editOpen && <Slider onClose={onEditClosed}>
                     <OptionEdit state={state} />
                   </Slider>
      }
    </div>
  )
}
