import * as React from 'react'
import './export.less'
import {Dispatch} from 'redux';

interface ExportProps {
  states: any[],
  dispatch: Dispatch<any>
}

class Export extends React.Component<ExportProps, any> {

  render() {
    return (
        <div className="export-container">
          <div className="export-buttons">
            <button className="export-button export-copy-button" onClick={this.copyToClipboard.bind(this)}> Copy To Clipboard</button>
            <button className="export-button export-download-button" onClick={this.downloadFile.bind(this)}> Download Code</button>
          </div>
          <code>
            <pre>{this.getCodeAsString()}</pre>
          </code>
          <a id="downloadAnchorElem" hidden></a>
        </div>
    );
  }

  getCodeAsString() {
    return JSON.stringify(this.props.states, null,  4);
  }

  copyToClipboard() {
    const text = this.getCodeAsString().replace(/<br>/g, '\r\n');

    if (window['clipboardData'] && window['clipboardData'].setData) {
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
        document.body.removeChild(textarea);
      }
    }
  }

  downloadFile() {
    const text = this.getCodeAsString().replace(/<br>/g, '\r\n');

    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(text)}`;
    const dlAnchorElem = document.getElementById('downloadAnchorElem');

    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'leonardo-states.json');
    dlAnchorElem.click();
  }
}

export default Export;

