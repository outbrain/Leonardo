import { handleActions} from 'redux-actions';

const initialState: any = {
  filterValue: '',
  states: parent['Leonardo'].getStates(),
  scenarios: parent['Leonardo'].getScenarios(),

};

export default handleActions({
  SET_FILTER: (state, action: any) => {
    return {...state, filterValue: action.filterValue}
  },
  ADD_STATE: (state, action) => {
    return state
  }
}, initialState)
