import * as React from 'react';
import {connect} from 'react-redux';
import {CSSTransitionGroup} from 'react-transition-group'

import './Slider.less';
interface ISliderState {
  viewState: boolean
}
interface ISliderProps extends ISliderState {
  onApply: Function,
  dispatch: any
}

class Slider extends React.Component<ISliderProps, any> {

  getContainerStyle() {
    return {
      display: this.props.viewState ? 'block' : 'none'
    }
  }

  getClassName() {
    return this.props.viewState ? 'slider-box slide-in' : 'slider-box slide-out';
  }

  render() {
    const sliderBox = this.props.viewState ? [
      <div className={this.getClassName()} key="sliderKey">
        <div className="slider-box-body">
          {this.props.children}
        </div>
        <div className="slider-box-feet">
          <button onClick={this.onCancel.bind(this)}>Cancel</button>
          <button onClick={this.onApply.bind(this)}>Apply</button>
        </div>
      </div>
    ] : [];
    return (
      <div style={this.getContainerStyle.call(this)} className="slider-container">
        <div className="slider-back"></div>
        <CSSTransitionGroup
            transitionName="slide"
            transitionEnterTimeout={300}
            transitionLeave={false}>
          {sliderBox}
        </CSSTransitionGroup>
      </div>
    );
  }

  onCancel() {
    this.props.dispatch({type: 'TOGGLE_SLIDER_VIEW', viewState: false, initData: {}})
  }

  onApply(item: any) {
    this.props.onApply && this.props.onApply(item);
  }

}

const mapStateToProps = state => {
  return ({
    viewState: state.commonReducer.sliderViewState
  })
};

export default connect<ISliderState, any, any>(mapStateToProps)(Slider);
