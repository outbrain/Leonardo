import { handleActions} from 'redux-actions';

const initialState: any = {
  sliderViewState: false
};


export default handleActions({
  TOGGLE_SLIDER_VIEW: (state, action: any) => {
    debugger;
    return {...state, sliderViewState: action.viewState, initData: action.initData}
  }

}, initialState)