import * as React from 'react';
import './Toggle.less';

export function Toggle({value, onToggle}) {
  const toggle = () => {
    onToggle(!value);
  };

  return (
    <div className="toggle-container">
      <input checked={value} onChange={() => {}} className="toggle-input" type="checkbox"/>
      <label className="toggle-label" onClick={() => toggle()}> </label>
    </div>
  );
}
