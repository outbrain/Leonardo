/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';
import RecorderList from './recorder-list/recorder-list';

export default class Recorder {

  viewNode: HTMLElement;
  recorderList: RecorderList;

  constructor(private menuView: HTMLElement) {
    this.recorderList = new RecorderList(menuView);
  }

  get() {
    return this.viewNode = Utils.getElementFromHtml(`<div id="leonardo-recorder" class="leonardo-recorder"</div>`);
  }

  render() {
    this.viewNode.appendChild(this.recorderList.get());
    this.recorderList.render();
  }

  destroy() {
    this.menuView.innerHTML = '';
  }
}
