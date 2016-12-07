import Utils from '../../../../ui-utils';

export default class StateDetail {
  viewNode: any;
  openState: boolean = false;
  curState;
  onCancelBinded: EventListener = this.onCancel.bind(this);
  onSaveBinded: EventListener = this.onSave.bind(this);
  constructor(private onSaveCB, private onCancelCB) {
    this.viewNode = Utils.getElementFromHtml(`<div id="leonardo-state-detail" class="leonardo-state-detail"></div>`);
  }

  get() {
    return this.viewNode;
  }

  render() {
    if(this.viewNode.innerHTML){
      this.viewNode.querySelector('.leonardo-states-detail-cancel').removeEventListener('click', this.onCancelBinded, false);
      this.viewNode.querySelector('.leonardo-states-detail-save').removeEventListener('click', this.onSaveBinded, false);
    }
    this.viewNode.innerHTML = `
      <div class="leonardo-states-detail-header"> 
        Edit option <strong>${this.curState.activeOption.name}</strong>
        for <strong>${this.curState.name}</strong>
        </div>
        <div>Status code: <input class="leonardo-states-detail-status" value="${this.curState.activeOption.status}"/></div>
        <div>Delay: <input class="leonardo-states-detail-delay" value="${this.curState.activeOption.delay}"/></div>
        <div>Response JSON:
          <textarea class="leonardo-states-detail-json">${this.getResString(this.curState.activeOption.data)}</textarea>
        </div>
        <button class="leonardo-button leonardo-states-detail-save">Save</button>
        <button class="leonardo-button leonardo-states-detail-cancel" >Cancel</button>`;
        this.viewNode.querySelector('.leonardo-states-detail-cancel').addEventListener('click', this.onCancelBinded, false);
        this.viewNode.querySelector('.leonardo-states-detail-save').addEventListener('click', this.onSaveBinded, false);
  }

  open(state) {
    this.curState = state;
    this.render();
    this.openState = true;
    this.viewNode.style.right = '0px';
  }

  close(state?) {
    if(state && this.curState !== state){
      this.open(state);
      return;
    }
    this.openState = false;
    this.viewNode.style.right = '-300px';
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
