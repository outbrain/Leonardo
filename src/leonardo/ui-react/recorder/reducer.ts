import {handleActions} from 'redux-actions';

const initialState: any = {
  states: parent['Leonardo'].getStates(),
};

export default handleActions({
  // ADD_STATE: (state, action) => {
  //   return state
  // }
}, initialState)
