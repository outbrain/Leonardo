import * as React from 'react'
import {createContext, useEffect, useState} from 'react';
import {LeonardoApi} from './LeonardoApi';

interface IRecorderContext {
  log?: any[];
  refreshLog?: () => void;
  clearAllLogs?: () => void;
  toggleRecordingEnabled?: () => void;
  getRecordingEnabled?: () => boolean;
}

const RecorderContext = createContext({} as IRecorderContext);

function RecorderProvider({ children }) {
  const [log, setLog] = useState(LeonardoApi.getRequestsLog());
  const refreshLog = () => { setLog([...LeonardoApi.getRequestsLog()]); };
  const clearAllLogs = () => { LeonardoApi.clearRequestsLog(); }
  const toggleRecordingEnabled = () => { LeonardoApi.toggleRecordingEnabled(); }
  const getRecordingEnabled = () => { return LeonardoApi.getRecordingEnabled(); }

  return (
    <RecorderContext.Provider value={{
      log,
      refreshLog,
      clearAllLogs,
      toggleRecordingEnabled,
      getRecordingEnabled
    }}>
      {children}
    </RecorderContext.Provider>
  )
}

export {
  RecorderContext,
  RecorderProvider
}
