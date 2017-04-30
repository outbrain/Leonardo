import DOMElement from '../DOMElement';
import Events from '../ui-events';
export default class CodeEditor extends DOMElement {
  editor: any;

  constructor(private onSaveCB: Function,
              private onCancelCB: Function,
              private initData: string) {
    super(`<div id="leonardo-code-editor" class="leonardo-code-editor"></div>`);
  }

  render() {
    super.render();
    this.viewNode.innerHTML = `<div class="leonardo-code-editor-container">
          <div class="leonardo-code-editor-header">
            <strong>Edit Response</strong>
            <a class="leonardo-code-editor-beautify">Beautify</a>
          </div>          
          <div class="leonardo-code-editor-body">
            <div id="leonardo-code-editor-edit-area"></div>
          </div>
          <div class="leonardo-code-editor-footer">
            <button class="leonardo-button leonardo-code-editor-save">Save</button>
            <button class="leonardo-button leonardo-code-editor-cancel" >Cancel</button>                        
          </div>           
      </div>`;
    Events.dispatch(Events.OPEN_DIALOG, this.viewNode);
    Events.onItem(this.viewNode.querySelector('.leonardo-code-editor-beautify'),'click', this.beautify.bind(this));
    Events.onItemOnce(this.viewNode.querySelector('.leonardo-code-editor-cancel'),'click', this.onCancel.bind(this));
    Events.onItemOnce(this.viewNode.querySelector('.leonardo-code-editor-save'), 'click', this.onSave.bind(this));
    this.editor = window['ace'].edit("leonardo-code-editor-edit-area");
    this.editor.getSession().setUseWorker(false);
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.setTheme("ace/theme/chrome");
    this.editor.setShowPrintMargin(false);
    this.editor.setValue(this.initData);
    this.editor.execCommand("gotolineend");
    this.editor.focus();
  }

  private getResString(resopnse: any): any {
    let resStr: string;
    try {
      if(typeof resopnse === 'function') {
        resStr = resopnse.toString();
      }
      else{
        resStr = JSON.stringify(resopnse, null, 4);
      }
    }
    catch(e){
      resStr = typeof resopnse === 'string' ? resopnse : resopnse.toString();
    }
    return resStr;
  }

  private onCancel() {
    this.onCancelCB();
    Events.dispatch(Events.CLOSE_DIALOG);
    this.destroy();
  }

  private onSave() {
    this.onSaveCB(this.editor.getValue());
    Events.dispatch(Events.CLOSE_DIALOG);
  }

  private beautify() {
    let val = this.editor.session.getValue();
    //Remove leading spaces
    let array = val.split(/\n/);
    array[0] = array[0].trim();
    val = array.join("\n");
    //Actual beautify (prettify)
    val = window['js_beautify'](val);
    //Change current text to formatted text
    this.editor.session.setValue(val);
  }

  destroy() {
    super.destroy();
    this.editor.destroy();
  }
}
