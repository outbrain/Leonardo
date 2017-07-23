import { handleActions} from 'redux-actions';

const initialState: any = {
  filterValue: '',
  items: parent['Leonardo'].getStates()
};

export default handleActions({
  SET_FILTER: (state, action: any) => {
    return {...state, filterValue: action.filterValue}
  },
  ADD_STATE: (state, action) => {
    return state
  }
}, initialState)