import {Dispatch} from 'redux'
import * as React from 'react'
import './Add-scenario.less'

interface AddScenarioProps {
  viewState: boolean;
  onClose: Function;
  dispatch: Dispatch<{}>;
}

export default class AddScenario extends React.Component<AddScenarioProps, any> {

  private scenarioName: string = '';

  getStyle() {
    return {
      display: this.props.viewState ? 'block' : 'none'
    }
  }

  setScenarioName(event) {
    this.scenarioName = event.target.value;
    this.setState({scenarioName: this.scenarioName})
  }

  render() {
    return (
      <div style={this.getStyle.call(this)} className="Add-scenario-container">
      <div className="add-scenario-box">
        <span>Scenario Name: </span>
        <input value={this.scenarioName} onChange={this.setScenarioName.bind(this)} className="add-scenario-name"/>
        <button disabled={!this.scenarioName} onClick={this.onSave.bind(this)}>Save</button>
        <button onClick={this.onCancel.bind(this)}>Cancel</button>
      </div>
    </div>)

  }

  onSave() {
    debugger;
    // if(window.parent['Leonardo'].getScenarios().some(scenario => scenario.name === this.scenarioName)){
    //   alert('Scenario name already in use');
    //   return;
    // }

    this.props.dispatch({type: 'ADD_SCENARIO', scenario: this.scenarioName});
    this.scenarioName = '';
    this.props.onClose();
  }

  onCancel() {
    this.scenarioName = '';
    this.props.onClose();
  }
}
