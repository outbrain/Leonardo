import {Dispatch} from 'redux'
import Scenarios from '../Scenarios/Scenarios';
import * as React from 'react'
import State from '../State/State'
import './States.less'
import {connect} from 'react-redux';

interface StatesProps {
  filterValue: string,
  states: any[];
  scenarios: any[];
  selectedScenario: any[];
  dispatch: Dispatch<{}>;
}

class States extends React.Component<StatesProps, any> {
  private setFilter(event) {
    this.props.dispatch({type: 'SET_FILTER', filterValue: event.target.value.toLowerCase()});
  }

  transformStates(items) {
    return items
      .map((item, i) => {
        return (
          <State item={item} key={i}/>
        )
      });
  }

  render() {
    let {states, scenarios, selectedScenario, dispatch} = this.props;
    states = this.transformStates(states);
    return (
      <div className="states-container">
        <div className="scenarios-container">
          <Scenarios scenarios={scenarios} selectedScenario={selectedScenario} dispatch={dispatch}/>
        </div>
        <div className="states-list">
          <div className="states-bar">
            <input className="search-state"
                   name="search-state"
                   type="text"
                   onChange={this.setFilter.bind(this)}
                   placeholder="Search..."/>
          </div>
          {states}
        </div>
      </div>
    );
  }
}

const filterItems = (items, filter) => {
  return items.filter(item => !filter || item.name.toLowerCase().includes(filter))
};

const mapStateToProps = state => {
  return ({
    states: filterItems(state.reducers.states, state.reducers.filterValue),
    scenarios: state.reducers.scenarios,
    selectedScenario: state.reducers.selectedScenario
  })
};

export default connect(mapStateToProps)(States);