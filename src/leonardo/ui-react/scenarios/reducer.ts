import { handleActions} from 'redux-actions';
import {debug} from 'util';
import {addScenario} from './actions';

const initialState: any = {
  filterValue: '',
  selectedScenario: '',
  states: parent['Leonardo'].getStates(),
  scenarios: parent['Leonardo'].getScenarios(),

};


export default handleActions({
  SET_FILTER: (state, action: any) => {

    return {...state, filterValue: action.filterValue}
  },
  ADD_SCENARIO: (state, action: any) => {
    window.parent['Leonardo'].addScenario({
      name: action.scenario,
      states: window.parent['Leonardo'].getStates().filter((state) => state.active),
      from_local: true
    }, true);
    return {...state, states: parent['Leonardo'].getStates(), scenarios: parent['Leonardo'].getScenarios(), selectedScenario: action.scenario}
  },
  ADD_STATE: (state, action) => {
    return state
  },
  SET_SCENARIO: (state, action: any) => {
    window.parent['Leonardo'].setActiveScenario(action.scenario);
    return {...state, states: parent['Leonardo'].getStates(), selectedScenario: action.scenario}
  },
  TOGGLE_ACTIVE_ALL: (state, action: any) => {
    window.parent['Leonardo'].toggleActivateAll(action.allState);
    return {...state, states: parent['Leonardo'].getStates()}
  },
  RESET_STATE: (state, action: any) => {
    window.parent['Leonardo'].storage.removeStates();
    return {...state, states: parent['Leonardo'].getStates()}
  }

}, initialState)
