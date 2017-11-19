import * as React from 'react';
import {connect} from 'react-redux';

import './Slider.less';
interface SliderProps {
  viewState: boolean,
  initData: any,
  dispatch: boolean
}

class Slider extends React.Component<any, any> {

  getContainerStyle() {
    return {
      display: this.props.viewState ? 'block' : 'none'
    }
  }

  getClassName() {
    return this.props.viewState ? 'slider-box slide-in' : 'slider-box slide-out';
  }

  render() {
    return (
      <div style={this.getContainerStyle.call(this)} className="slider-container">
        <div className="slider-back"></div>
        <div className={this.getClassName.call(this)}>
          <div  className="slider-box-body"></div>
          <div className="slider-box-feet">
            <button onClick={this.onCancel.bind(this)}>Cancel</button>
            <button>Apply</button>
          </div>
        </div>
      </div>
    );
  }

  onCancel() {
    this.props.dispatch({type: 'TOGGLE_SLIDER_VIEW', viewState: false, initData: {}})
  }

}

const mapStateToProps = state => {
  return ({
    viewState: state.commonReducer.sliderViewState
  })
};

export default connect(mapStateToProps)(Slider);