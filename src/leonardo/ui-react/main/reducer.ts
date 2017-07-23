import { handleActions} from 'redux-actions';
import {debug} from 'util';

const initialState: any = {
  filterValue: '',
  selectedScenario: '',
  states: parent['Leonardo'].getStates(),
  scenarios: parent['Leonardo'].getScenarios(),

};
debugger;

export default handleActions({
  SET_FILTER: (state, action: any) => {
    return {...state, filterValue: action.filterValue}
  },
  ADD_STATE: (state, action) => {
    return state
  },
  SET_SCENARIO: (state, action: any) => {
    debugger;
    return {...state, states: parent['Leonardo'].getStates(), selectedScenario: action.scenario}
  }
}, initialState)