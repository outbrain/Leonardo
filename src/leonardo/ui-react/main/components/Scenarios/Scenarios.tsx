import * as React from 'react';
import './Scenarios.less';
import UiUtils from '../../../ui-utils';

interface ScenariosProps {
  scenarios: any;
}
export default class Scenarios extends React.Component<any, any> {
  randomID = UiUtils.guidGenerator();

  render() {
    let {scenarios} = this.props;
    scenarios = scenarios.map((item, index) => {
      return <li key={index}>{item}</li>;
    });
    return (
        <div className="scenarios-list">
          <ul>
          {scenarios}
          </ul>
        </div>

    )
  }
}