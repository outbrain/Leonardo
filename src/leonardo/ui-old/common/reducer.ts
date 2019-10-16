import { handleActions} from 'redux-actions';

const initialState: any = {
  sliderViewState: false,
  selectedState: ''
};


export default handleActions({
  TOGGLE_SLIDER_VIEW: (state, action: any) => {
    return {...state, sliderViewState: action.viewState, selectedState: action.initData}
  }

}, initialState)
