import * as React from 'react';
import './Scenarios.less';
import {ScenarioContext} from '../../context/ScenariosContext';
import {useContext} from 'react';

export function Scenarios() {
  const scenarioContext = useContext(ScenarioContext);
  const renderScenario = (scenario) => {
    return (<li key={scenario} className="btn scenario" onClick={() => scenarioContext.setScenario(scenario)}>{scenario}</li>)
  };

  return (
    <div className="scenarios">
      <div className="scenarios-header">scenarios</div>
      <ul>
        {scenarioContext.scenarios.map(scenario => renderScenario(scenario))}
      </ul>
    </div>
  );
}
