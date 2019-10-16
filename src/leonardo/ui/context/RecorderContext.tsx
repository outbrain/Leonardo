import * as React from 'react'
import {createContext, useEffect, useState} from 'react';
import {LeonardoApi} from './LeonardoApi';

interface IRecorderContext {
  log?: any[];
  refreshLog?: () => void;
}

const RecorderContext = createContext({} as IRecorderContext);

function RecorderProvider({ children }) {
  const [log, setLog] = useState(LeonardoApi.getRequestsLog());
  const refreshLog = () => { setLog([...LeonardoApi.getRequestsLog()]); };
  return (
    <RecorderContext.Provider value={{
      log,
      refreshLog
    }}>
      {children}
    </RecorderContext.Provider>
  )
}

export {
  RecorderContext,
  RecorderProvider
}
