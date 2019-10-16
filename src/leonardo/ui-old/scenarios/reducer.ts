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
  REMOVE_STATE: (state, action) => {
    return {...state, states: state.states.filter(s => s.name != action.payload.stateName)};
  },
  REFRESH_STATES: (state, action: any) => {
    return {...state, states: parent['Leonardo'].getStates()}
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
  },
  UPDATE_STATE: (state, action: any) => {
    action.updatedState.activeOption.status = parseInt(action.updatedState.activeOption.status);
    window.parent['Leonardo'].addOrUpdateSavedState(action.updatedState);
    return {...state, states: parent['Leonardo'].getStates()}
  }

}, initialState)
