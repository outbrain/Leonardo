/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';

export default class Export {

  viewNode: HTMLElement;

  constructor() {
  }

  get() {
    return this.viewNode = Utils.getElementFromHtml(`<div id="leonardo-export" class="leonardo-export">
      <button class="leonardo-button exportButtons" data-clipboard-target="#exportedCode"> Copy To Clipboard</button>
      <button class="leonardo-button exportButtons" > Download Code</button>
      <code contenteditable>
        <div id="exportedCode">
          
        </div>
      </code>
    </div>`);
  }

  render() {

  }

  destroy() {

  }

}
