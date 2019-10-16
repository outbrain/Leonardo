import * as React from 'react';
import {Header} from '../Header/Header';
import './App.less';
import {MainContent} from '../MainContent/MainContent';
import {MenuProvider} from '../../context/MenuContext';
import {StatesProvider} from '../../context/StatesContext';

export function App() {
  return (
    <MenuProvider>
      <Header />
      <StatesProvider>
        <MainContent />
      </StatesProvider>
    </MenuProvider>
  );
}
