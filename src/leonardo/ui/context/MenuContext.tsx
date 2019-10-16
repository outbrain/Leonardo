import * as React from 'react'
import {createContext, useState} from 'react';

interface IMenuContext {
  tabs?: string[];
  tab?: string;
  setTab?: (tab: string) => void;
}

const MenuContext = createContext({} as IMenuContext);

function MenuProvider({ children }) {
  const tabs = ['states', 'recorder', 'exported code'];
  const [currentTab, setTab] = useState('states');

  return (
    <MenuContext.Provider value={{
      tab: currentTab,
      tabs,
      setTab
    }}>
      {children}
    </MenuContext.Provider>
  )
}

export {
  MenuProvider,
  MenuContext
}
