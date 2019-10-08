import {Dispatch} from 'redux'
import * as React from 'react'
import AddScenario from '../Add-scenario/Add-scenario';
import './States-control-bar.less'

interface StatesControlBarProps {
  filterValue: string,
  dispatch: Dispatch<{}>;
}

export default class StatesControlBar extends React.Component<StatesControlBarProps, any> {
  private activeAllState = false;
  private addScenarioViewState = false;

  private setFilter(event) {
    this.props.dispatch({type: 'SET_FILTER', filterValue: event.target.value.toLowerCase()});
  }

  render() {
    let {filterValue} = this.props;
    return (
      <div className="states-control-bar">
        <input className="search-state"
               name="search-state"
               type="text"
               value={filterValue}
               onChange={this.setFilter.bind(this)}
               placeholder="Search..."/>
        <div className="states-control-bar-buttons">
          <button onClick={this.toggleActivateAll.bind(this)}>{!this.activeAllState ? 'Activate' : 'Deactivate'} All
          </button>
          <button onClick={this.resetStates.bind(this)}>Reset States</button>
          <button onClick={this.addScenario.bind(this)}>Add Scenario</button>
        </div>
        <AddScenario viewState={this.addScenarioViewState} onClose={this.onCloseAddScenario.bind(this)} dispatch={this.props.dispatch}/>
      </div>
    );
  }

  onCloseAddScenario() {
    this.addScenarioViewState = false;
    this.setState({addScenarioViewState: this.addScenarioViewState})
  }

  toggleActivateAll() {
    this.activeAllState = !this.activeAllState;
    this.props.dispatch({type: 'TOGGLE_ACTIVE_ALL', allState: this.activeAllState});
  }

  resetStates() {
    if (window.confirm('Are you sure you want to reset states?')) {
      this.props.dispatch({type: 'TOGGLE_ACTIVE_ALL', allState: false});
    }
  }

  addScenario() {
    this.addScenarioViewState = !this.addScenarioViewState;
    this.setState({addScenarioViewState: this.addScenarioViewState})
  }
}
