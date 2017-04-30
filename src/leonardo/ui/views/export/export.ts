/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';
import DOMElement from '../../DOMElement';
import StringHelper from '../../helpers/string.helper';

declare var window;

export default class Export extends DOMElement {

  constructor() {
    super(`<div id="leonardo-export" class="leonardo-export">`);
  }

  render() {
    super.render();
    this.viewNode.innerHTML = `
      <button id="leonardo-copy-clipboard-btn" class="leonardo-button leonardo-export-buttons" data-clipboard-target="#leonardo-exported-code"> Copy To Clipboard</button>
      <button id="leonardo-download-code-btn" class="leonardo-button leonardo-export-buttons"> Download Code</button>
      <div class="leonardo-spacer"></div>
      <code contenteditable>
        <div id="leonardo-exported-code" class="leonardo-exported-code">
            <pre>${StringHelper.trim(JSON.stringify(Leonardo.getStates(), null,  4))}</pre>
        </div>
      </code>
      <a id="downloadAnchorElem" style="display:none"></a>
    </div>`;


    Events.onItem(this.viewNode.querySelector('#leonardo-copy-clipboard-btn'), 'click', this.copyToClipboard.bind(this));
    Events.onItem(this.viewNode.querySelector('#leonardo-download-code-btn'), 'click', this.downloadFile.bind(this));
  }

  downloadFile() {
    const inner = this.viewNode.querySelector('#leonardo-exported-code pre').innerHTML || '';
    const text = StringHelper.trim(inner).replace(/<br>/g, '\r\n');

    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(text)}`;
    const dlAnchorElem = document.getElementById('downloadAnchorElem');

    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'leonardo-states.json');
    dlAnchorElem.click();
  }

  copyToClipboard() {
    const inner = this.viewNode.querySelector('#leonardo-exported-code pre').innerHTML || '';
    const text = StringHelper.trim(inner).replace(/<br>/g, '\r\n');

    if (window.clipboardData && window.clipboardData.setData) {
      return window.clipboardData.setData('Text', text);
    } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
      var textarea = document.createElement('textarea');
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

  // Override base so we dont clear viewNode
  destroy() {
  }

}
