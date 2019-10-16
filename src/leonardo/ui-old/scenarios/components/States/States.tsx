import {Dispatch} from 'redux'
import Scenarios from '../Scenarios/Scenarios';
import * as React from 'react'
import State from '../State/State'
import StatesControlBar from '../States-control-bar/States-control-bar';
import './States.less'
import {connect} from 'react-redux';
import Slider from '../../../common/components/Slider/Slider';
import EditOption from '../EditOption/EditOption';
import {IState} from '../../../../configuration.srv';

interface StatesProps {
  filterValue: string,
  states: any[];
  scenarios: any[];
  selectedScenario: any[];
  dispatch: Dispatch<{}>;
}

class States extends React.Component<StatesProps, any> {
  editItem: IState;
  private setFilter(event) {
    this.props.dispatch({type: 'SET_FILTER', filterValue: event.target.value.toLowerCase()});
  }

  transformStates(items) {
    return items
      .map((item, i) => {
        return (
          <div className="state-container" onClick={this.editState.bind(this, item)} key={i}>
            <State item={item}/>
          </div>
        )
      });
  }

  editState(item: IState) {
    this.editItem = item;
    this.props.dispatch({type: 'TOGGLE_SLIDER_VIEW', viewState: true});
  }

  onEditStateChanged(event) {
    this.editItem.activeOption[event.target.name] = event.target.value;
  }

  saveEditState() {
    this.props.dispatch({type: 'UPDATE_STATE', updatedState: this.editItem});
    this.props.dispatch({type: 'TOGGLE_SLIDER_VIEW', viewState: false});
  }

  render() {
    let {states, scenarios, selectedScenario, filterValue, dispatch} = this.props;
    states = this.transformStates(states);
    return (
      <div className="states-container">
        <div className="scenarios-container">
          <Scenarios scenarios={scenarios} selectedScenario={selectedScenario} dispatch={dispatch}/>
        </div>
        <div className="states-list">
         <StatesControlBar filterValue={filterValue} dispatch={dispatch}/>
          {states}
        </div>
        <Slider onApply={this.saveEditState.bind(this)}>
          <EditOption onChange={this.onEditStateChanged.bind(this)} selectedState={this.editItem}></EditOption>
        </Slider>
      </div>
    );
  }
}

const filterItems = (items, filter) => {
  return items.filter(item => !filter || item.name.toLowerCase().includes(filter))
};

const mapStateToProps = state => {
  const {scenariosReducer} = state;
  return ({
    states: filterItems(scenariosReducer.states, scenariosReducer.filterValue),
    scenarios: scenariosReducer.scenarios,
    filterValue: scenariosReducer.filterValue,
    selectedScenario: scenariosReducer.selectedScenario
  })
};

export default connect(mapStateToProps)(States);
