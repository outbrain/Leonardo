import * as React from 'react';
import './Scenarios.less';
import UiUtils from '../../../ui-utils';

interface ScenariosProps {
  scenarios: any;
  selectedScenario: any;
  dispatch: any;
}
export default class Scenarios extends React.Component<any, any> {
  randomID = UiUtils.guidGenerator();

  render() {
    debugger;
    let {scenarios, selectedScenario} = this.props;
    scenarios = scenarios.map((item, index) => {
      return <li className={selectedScenario === item ? 'selected-scenario' : ''} key={index} onClick={this.selectScenario.bind(this, item)}>{item}</li>;
    });
    return (
        <div className="scenarios-list">
          <ul>
          {scenarios}
          </ul>
        </div>

    )
  }

  selectScenario(scenario){
    debugger;
    window.parent['Leonardo'].setActiveScenario(scenario);
    this.props.dispatch({type: 'SET_SCENARIO', scenario: scenario});

  }
}