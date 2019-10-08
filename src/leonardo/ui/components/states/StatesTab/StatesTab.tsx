import * as React from 'react';
import './StatesTab.less';
import {Scenarios} from '../../Scenarios/Scenarios';
import {StatesList} from '../StatesList/StatesList';
import {ScenariosProvider} from '../../../context/ScenariosContext';
import {StatesProvider} from '../../../context/StatesContext';

export function StatesTab() {
  return (
      <div className="states-tab">
        <StatesProvider>
          <ScenariosProvider>
            <Scenarios />
          </ScenariosProvider>
          <StatesList/>
        </StatesProvider>
      </div>
    );
}
