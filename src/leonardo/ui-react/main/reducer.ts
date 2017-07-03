import { handleActions} from 'redux-actions';

const initialState: any = {
  items: parent['Leonardo'].getStates()
}

export default handleActions({
  ADD_STATE: (state, action) => {
    return state
  }
}, initialState)