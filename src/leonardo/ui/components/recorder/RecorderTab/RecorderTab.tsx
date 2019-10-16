import * as React from 'react';
import './RecorderTab.less';
import {RecorderList} from '../RecorderList/RecorderList';
import {RecorderProvider} from '../../../context/RecorderContext';

export function RecorderTab() {
  return (
    <RecorderProvider>
      <div className="recorder-tab">
        <RecorderList/>
      </div>
    </RecorderProvider>
    );
}
