import * as React from 'react';
import './StatesTab.less';
import {Scenarios} from '../../Scenarios/Scenarios';
import {StatesList} from '../StatesList/StatesList';
import {ScenariosProvider} from '../../../context/ScenariosContext';

export function StatesTab() {
  return (
      <div className="states-tab">
        <ScenariosProvider>
          <Scenarios />
        </ScenariosProvider>
        <StatesList/>
      </div>
    );
}
