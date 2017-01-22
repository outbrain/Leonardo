import Utils from '../../../../ui-utils';
import Events from '../../../../ui-events';
import DOMElement from '../../../../DOMElement';
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
          <p>Response:</p>          
          <textarea class="leonardo-states-detail-json">${this.getResString(this.curState.activeOption.data)}</textarea>
        </div>
        <div class="leonardo-states-detail-buttons">
          <button class="leonardo-button leonardo-states-detail-save">Save</button>
          <button class="leonardo-button leonardo-states-detail-cancel" >Cancel</button>
        </div>`;

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

  private getResString(resopnse: string): string {
    let resStr: string;
    try {
      resStr = JSON.stringify(resopnse, null, 4);
    }
    catch(e){
      resStr = typeof resopnse === 'string' ? resopnse : resopnse.toString();
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
      this.curState.activeOption.data = JSON.parse(jsonVal);
    }
    catch(e) {
      this.curState.activeOption.data = jsonVal;
    }

    Leonardo.addOrUpdateSavedState(this.curState);
    this.close();
    this.onSaveCB();
  }
}
