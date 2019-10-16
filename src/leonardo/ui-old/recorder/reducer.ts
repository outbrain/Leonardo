import {handleActions} from 'redux-actions';

const initialState: any = {
  states: parent['Leonardo'].getStates(),
  recorderItems: parent['Leonardo'].getRecordedStates(),
};

export default handleActions({
  UPDATE_RECORDER_DATA: (state) => {
    return {...state, recorderItems: parent['Leonardo'].getRecordedStates()}
  }
}, initialState)
