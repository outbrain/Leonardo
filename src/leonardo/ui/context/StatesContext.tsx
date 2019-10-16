import * as React from 'react'
import {createContext, useEffect, useState} from 'react';
import {LeonardoApi} from './LeonardoApi';

interface IStatesContext {
  states?: any[];
  refreshStates?: () => void;
  deactivateAll?: () => void;
  setStatesActive?: (isActive: boolean) => void;
  isAllActive?: boolean;
  activateState?: (state: any, active: boolean) => void;
  setStateOption?: (state: any, option: string) => void;
}

const StatesContext = createContext({} as IStatesContext);

function StatesProvider({ children }) {
  const [states, setStates] = useState(LeonardoApi.getStates());
  const [isAllActive, setAllActive] = useState(null);
  const refreshStates = () => { setStates(LeonardoApi.getStates()); };
  useEffect(() => {
    if (isAllActive !== null) {
      LeonardoApi.toggleActivateAll(isAllActive);
      refreshStates();
      setAllActive(null);
    }
  });

  const setStatesActive = (isActive: boolean) => {
    setAllActive(isActive);
  };

  const activateState = (state: any, active: boolean) => {
    if (active) {
      LeonardoApi.activateStateOption(state.name, state.activeOption.name);
    } else {
      LeonardoApi.deactivateState(state.name);
    }
    refreshStates();
  };

  const setStateOption = (state, option) => {
    LeonardoApi.activateStateOption(state.name, option);
    refreshStates();
  };

  return (
    <StatesContext.Provider value={{
      states,
      refreshStates,
      setStatesActive,
      isAllActive,
      activateState,
      setStateOption
    }}>
      {children}
    </StatesContext.Provider>
  )
}

export {
  StatesContext,
  StatesProvider
}
