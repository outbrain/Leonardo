import * as React from 'react';
import './Slider.less';
import {useEffect, useState, useCallback} from 'react';

export function Slider({children, onClose}) {
  const [currentData, setCurrentData] = useState(null);
  const [visible, setVisible] = useState(null);
  const close = (cancel) => {
    cancel && setCurrentData(null);
    setVisible(false);
  };

  const escFunction = useCallback((event) => {
    if(event.keyCode === 27) {
      close(false)
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", escFunction);

    return () => {
      document.removeEventListener("keydown", escFunction);
    };
  });

  useEffect(() => {
    if (visible === null) {
      setTimeout(() => setVisible(true), 50);
      return;
    }
    if (!visible) {
      setTimeout(() => onClose({
        canceled: !currentData,
        data: currentData
      }), 500);
    }
  }, [visible]);

  const onDataChanged = ({isValid = true, data}) => {
    setCurrentData(isValid ? data : null);
  };

  return (
    <div className={'slider-container ' + (visible === true ? 'slider-open' : 'slider-closed')}>
      <div className="slider-back" onClick={() => close(true)}></div>
      <div className="slider-box" >
        <div className="slider-box-body">
          {React.cloneElement(children, { onDataChanged: onDataChanged })}
        </div>
        <div className="slider-box-footer">
          <button className="btn" onClick={() => close(true)}>Cancel</button>
          <button className="btn btn-action" onClick={() => close(false)} disabled={!currentData}>Apply</button>
        </div>
      </div>
    </div>
  );
}
