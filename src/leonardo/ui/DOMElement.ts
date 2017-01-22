import {EventSub} from './ui-events';
import Events from './ui-events';
import UiUtils from './ui-utils';
export default class DOMElement {
  protected viewNode: any;
  protected eventSubs: Array<EventSub> = [];
  protected bodyEventsSubs:Array<EventSub> = [];
  constructor(private viewString: string = '') {
    this.viewNode = UiUtils.getElementFromHtml(this.viewString);
  }

  get(): HTMLElement {
    return this.viewNode;
  }

  protected render(){
    if(!this.viewNode){
      return;
    }
    this.viewNode.innerHTML = '';
  }

  protected onItem(node: HTMLElement, eventType: string, cb: EventListener): EventSub {
    const eventSub: EventSub =  Events.onItem(node, eventType, cb);
    this.eventSubs.push(eventSub);
    return eventSub;
  }


  protected clearEventSubs() {
    this.clearSetEventSubs(this.eventSubs);
  }

  protected clearSetEventSubs(list: Array<EventSub>) {
    list.forEach((listener: EventSub)=> {
      listener.off();
    })
  }

  destroy() {
    this.clearSetEventSubs(this.bodyEventsSubs);
    this.clearEventSubs();
    this.viewNode = null;
  }
}
