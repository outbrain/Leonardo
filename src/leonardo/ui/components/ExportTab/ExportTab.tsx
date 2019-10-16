import * as React from 'react'
import './ExportTab.less'
import {useContext, useEffect, useState} from 'react';
import {StatesContext} from '../../context/StatesContext';

export function ExportTab() {
  const statesContext = useContext(StatesContext);
  const [copy, setCopy] = useState(null);

  useEffect(() => {
    if (copy) {
      const timer = setTimeout(() => setCopy(false), 500);
      return () => clearTimeout(timer);
    }
  }, [copy]);

  const copyToClipboard = () => {
    const text = getCodeAsString().replace(/<br>/g, '\r\n');

    if (window['clipboardData'] && window['clipboardData'].setData) {
      setCopy(true);
      return window['clipboardData'].setData('Text', text);
    } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
      const textarea = document.createElement('textarea');
      textarea.textContent = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand('copy');
      } catch (ex) {
        console.warn('Copy to clipboard failed.', ex);
        return false;
      } finally {
        setCopy(true);
        document.body.removeChild(textarea);
      }
    }
  };

  const downloadFile = () => {
    const text = getCodeAsString().replace(/<br>/g, '\r\n');

    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(text)}`;
    const dlAnchorElem = document.getElementById('downloadAnchorElem');

    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'leonardo-states.json');
    dlAnchorElem.click();
  };

  const getCodeAsString = () => {
    const states = statesContext.states.map(({active, activeOption, from_local, ...state}) => state);
    states.forEach(state => {
      state.options = (state.options || []).map(({from_local, ...opt}) => opt);
    });

    const replacer = (key, value) => {

      if (value && value.compile && value.test) {
        return `__#${value.toString()}__#`;
      }
      return value;
    };
    return JSON.stringify(states, replacer,  2)
      .split(/"__#|__#"/).join('')
      .split('\\\\').join('\\');
  };

  return (
      <div className="export-container">
        <div className="export-buttons">
          <button className={'btn export-copy-button' +  (copy ? ' export-copied' : '')} onClick={() => copyToClipboard()}>Copy To Clipboard</button>
          <button className="btn export-download-button" onClick={() => downloadFile()}>Download Code</button>
        </div>
        <code>
          <pre>{getCodeAsString()}</pre>
        </code>
        <a id="downloadAnchorElem" hidden></a>
      </div>
  );
}

