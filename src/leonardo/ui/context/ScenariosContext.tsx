import * as React from 'react'
import {createContext, useContext, useEffect, useState} from 'react';
import {LeonardoApi} from './LeonardoApi';
import {StatesContext} from './StatesContext';

interface IScenarioContext {
  scenarios?: string[];
  scenario?: string;
  setScenario?: (scenario: string) => void;
}

const ScenarioContext = createContext({} as IScenarioContext);

function ScenariosProvider({ children }) {
  const statesContext = useContext(StatesContext);
  const [currentScenario, setScenario] = useState(null);
  const [scenarios] = useState(LeonardoApi.getScenarios());

  useEffect(() => {
    if (currentScenario !== null) {
      LeonardoApi.setActiveScenario(currentScenario);
      statesContext.refreshStates();
      setScenario(null);
    }
  });

  return (
    <ScenarioContext.Provider value={{
      scenario: currentScenario,
      scenarios: scenarios,
      setScenario: setScenario
    }}>
      {children}
    </ScenarioContext.Provider>
  )
}

export {
  ScenariosProvider,
  ScenarioContext
}
