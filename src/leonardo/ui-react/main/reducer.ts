import { handleActions} from 'redux-actions';

console.log(( window as any).Leonardo.getStates())
const initialState: any = {
  items:( window as any).Leonardo.getStates()
};

export default handleActions({
  ADD_STATE: (state, action) => {
    return state
  }
}, initialState)