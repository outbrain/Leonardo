/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';
import RecorderList from './recorder-list/recorder-list';
import DOMElement from '../../DOMElement';

export default class Recorder extends DOMElement {

  recorderList: RecorderList;

  constructor(private menuView: HTMLElement) {
    super(`<div id="leonardo-recorder" class="leonardo-recorder"</div>`);
    this.recorderList = new RecorderList(menuView);
  }

  render() {
    super.render();
    this.viewNode.appendChild(this.recorderList.get());
    this.recorderList.render();
  }

  // Override base so we dont clear viewNode
  destroy() {

  }
}
