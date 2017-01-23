import Utils from '../../../../ui-utils';
import Events from '../../../../ui-events';
import DOMElement from '../../../../DOMElement';
import CodeEditor from '../../../../code-editor/code-editor';
export default class StateDetail extends DOMElement {

  openState: boolean = false;
  curState;

  constructor(private onSaveCB, private onCancelCB) {
    super(`<div id="leonardo-state-detail" class="leonardo-state-detail"></div>`);
  }

  render() {
    super.render();
    this.viewNode.innerHTML = `
      <div class="leonardo-states-detail-container"> 
        <div class="leonardo-states-detail-top">Edit option <strong>${this.curState.activeOption.name}</strong>
        for <strong>${this.curState.name}</strong>
        </div>
        
        <div class="leonardo-states-detail-input"><div>Status code: </div><input class="leonardo-states-detail-status" value="${this.curState.activeOption.status}"/></div>
        <div class="leonardo-states-detail-input"><div>Delay: </div><input class="leonardo-states-detail-delay" value="${this.curState.activeOption.delay}"/></div>
        <div>
          <br/> 
          <span>Response:</span>    <button class="leonardo-button leonardo-states-detail-edit">Advanced</button>      
          <textarea class="leonardo-states-detail-json">${this.getResString(this.curState.activeOption.data)}</textarea>          
        </div>
        <div class="leonardo-states-detail-buttons">        
          <button class="leonardo-button leonardo-states-detail-save">Save</button>
          <button class="leonardo-button leonardo-states-detail-cancel" >Cancel</button>
        </div>`;
        Events.onItem(this.viewNode.querySelector('.leonardo-states-detail-edit'), 'click', this.editMode.bind(this));
        Events.onItemOnce(this.viewNode.querySelector('.leonardo-states-detail-cancel'),'click', this.onCancel.bind(this));
        Events.onItemOnce(this.viewNode.querySelector('.leonardo-states-detail-save'), 'click', this.onSave.bind(this));

  }

  open(state) {
    this.curState = state;
    this.render();
    this.openState = true;
    Events.dispatch(Events.OPEN_MENU);
  }

  close(state?) {
    if(state && this.curState !== state){
      this.open(state);
      return;
    }

    this.openState = false;
    Events.dispatch(Events.CLOSE_MENU);
  }

  toggle(state) {
    if(this.openState){
      this.close(state);
      return;
    }
    this.open(state);
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

  private onCancel() {
    this.close();
    this.onCancelCB();
  }

  private onSave() {
    const statusVal:string = this.viewNode.querySelector(".leonardo-states-detail-status").value;
    const delayVal:string = this.viewNode.querySelector(".leonardo-states-detail-delay").value;
    const jsonVal:string = this.viewNode.querySelector(".leonardo-states-detail-json").value;

    this.curState.activeOption.status = statusVal;
    this.curState.activeOption.delay = delayVal;
    try{
      if(jsonVal.trim().indexOf('function') === 0){
        this.curState.activeOption.data = eval('(' + jsonVal + ')');
      }
      else{
        this.curState.activeOption.data = JSON.parse(jsonVal);
      }
    }
    catch(e) {
      this.curState.activeOption.data = jsonVal;
    }

    Leonardo.addOrUpdateSavedState(this.curState);
    this.close();
    this.onSaveCB();
  }
}
