/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';
import DOMElement from '../../DOMElement';

export default class Export extends DOMElement {

  constructor() {
    super(`<div id="leonardo-export" class="leonardo-export">`);
  }

  render() {
    super.render();
    this.viewNode.innerHTML = `
      <button class="leonardo-button leonardo-export-buttons" data-clipboard-target="#leonardo-exported-code"> Copy To Clipboard</button>
      <button class="leonardo-button leonardo-export-buttons"> Download Code</button>
      <div class="leonardo-spacer"></div>
      <code contenteditable>
        <div id="leonardo-exported-code" class="leonardo-exported-code">
            ${JSON.stringify(Leonardo.getStates(), null,  4)}      
        </div>
      </code>
    </div>`;
  }

  // Override base so we dont clear viewNode
  destroy() {

  }

}
