import Utils from '../../../ui-utils';
import Events from '../../../ui-events';
import DOMElement from '../../../DOMElement';
import CodeEditor from '../../../code-editor/code-editor';
export default class RecorderStateDetail extends DOMElement {
  openState: boolean = false;
  curState;

  constructor() {
    super(`<div id="leonardo-state-detail" class="leonardo-state-detail-recorder"></div>`);
  }

  render() {
    super.render();
    let html;

    //TODO congratulate ourselves on being awesome!!
    if (this.curState.recorded) {
      html = `<div class="leonardo-states-detail-top">Add mocked response for <strong>${this.curState.name}</strong></div>`;
    }
    else {
      html = `<h1 class="leonardo-states-detail-top"/>Add new state</h1>
              <div class="leonardo-states-detail-input">State name: <input class="leonardo-states-detail-state-name" value="${this.curState.name}"/></div>`;
    }

    html += `<div class="leonardo-states-detail-input"><div>URL: </div><input class="leonardo-states-detail-option-url" value="${this.curState.url}"/></div>
              <div class="leonardo-states-detail-input"><div>Option name: </div><input class="leonardo-states-detail-option-name" value="${this.curState.options[0].name}"/></div>
              <div class="leonardo-states-detail-input"><div>Status code: </div><input class="leonardo-states-detail-status" value="${this.curState.options[0].status}"/></div>
              <div class="leonardo-states-detail-input"><div>Delay: </div><input class="leonardo-states-detail-delay" value="0"/></div>
              <br/>
              <span>Response:</span>    <button class="leonardo-button leonardo-states-detail-edit">Advanced</button> 
              <textarea class="leonardo-states-detail-json">${this.getResString(this.curState.options[0].data)}</textarea></p>
              <div class="leonardo-states-detail-buttons">
                <button class="leonardo-button leonardo-states-detail-save">Save</button>
                <button class="leonardo-button leonardo-states-detail-cancel" >Cancel</button>
              </div>`;

    this.viewNode.innerHTML = html;
    Events.onItem(this.viewNode.querySelector('.leonardo-states-detail-edit'), 'click', this.editMode.bind(this));
    Events.onItemOnce(this.viewNode.querySelector('.leonardo-states-detail-cancel'), 'click', this.onCancel.bind(this));
    Events.onItemOnce(this.viewNode.querySelector('.leonardo-states-detail-save'), 'click', this.onSave.bind(this));
  }

  open(state) {
    this.curState = state;
    this.render();
    this.openState = true;
    Events.dispatch(Events.OPEN_MENU);
  }

  editMode(){
    const editor = new CodeEditor(this.closeEditMode.bind(this), this.closeEditMode.bind(this), this.viewNode.querySelector(".leonardo-states-detail-json").value);
    editor.render();
  }

  private closeEditMode(data){
    if(!data){
      return;
    }
    this.viewNode.querySelector(".leonardo-states-detail-json").value = this.getResString(data);
  }

  close(state?) {
    if (state && this.curState !== state) {
      this.open(state);
      return;
    }
    this.openState = false;
    Events.dispatch(Events.CLOSE_MENU);
  }

  toggle(state) {
    if (this.openState) {
      this.close(state);
      return;
    }
    this.open(state);
  }

  private getResString(resopnse: string): string {
    let resStr: string;

    try {
      switch (typeof resopnse){
        case 'function':
          resStr = resopnse.toString();
          break;
        case 'object':
          resStr = JSON.stringify(resopnse, null, 4);
          break;
        default:
          return resStr = resopnse;
      }
    }
    catch(e){
      return resStr;
    }
    return resStr;
  }

  private onCancel(event: Event) {
    this.close();
  }

  private onSave() {
    const urlVal: string = this.viewNode.querySelector(".leonardo-states-detail-option-url").value;
    const statusVal: string = this.viewNode.querySelector(".leonardo-states-detail-status").value;
    const delayVal: string = this.viewNode.querySelector(".leonardo-states-detail-delay").value;
    const jsonVal: string = this.viewNode.querySelector(".leonardo-states-detail-json").value;
    const optionNameVal: string = this.viewNode.querySelector(".leonardo-states-detail-option-name").value;
    this.curState.url = urlVal;
    this.curState.activeOption.status = statusVal;
    this.curState.activeOption.delay = delayVal;
    this.curState.activeOption.name = optionNameVal;
    if (!this.curState.recorded) {
      this.curState.name = this.viewNode.querySelector('.leonardo-states-detail-state-name').value;
    }
    try {

      this.curState.activeOption.data = JSON.parse(jsonVal);
    }
    catch (e) {
      this.curState.activeOption.data = jsonVal;
    }


    Leonardo.addOrUpdateSavedState(this.curState);
    this.close();
  }
}
