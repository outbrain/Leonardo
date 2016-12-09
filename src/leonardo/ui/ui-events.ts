/// <reference path="../leonardo.d.ts" />
export interface EventSub {
  off: Function
}


export default {
  TOGGLE_LAUNCHER: 'leonardo:toggle:launcher',
  CHANGE_VIEW: 'leonardo:change:view',
  FILTER_STATES: 'leonardo:filter:states',
  CLOSE_DROPDOWNS: 'leonardo:close:dropdowns',
  TOGGLE_STATES: 'leonardo:toggle:states',
  TOGGLE_SCENARIOS: 'leonardo:toggle:scenario',
  ADD_SCENARIO: 'leonardo:add:scenario',
  TOGGLE_STATE: 'leonardo:toggle:states',
  TOGGLE_ICON: 'leonardo:toggle:icon',

  //We want to maintain scope here
  on: function(eventName: string, fn: EventListenerOrEventListenerObject) {
    return this.onItem(document.body, eventName, fn);
  },
  onOnce: function(eventName: string, fn: EventListenerOrEventListenerObject){
    this.onItemOnce(document.body, eventName, fn);
  },
  dispatch: (eventName: string, details?: any) => {
    const event = new CustomEvent(eventName, {detail: details});
    document.body.dispatchEvent(event);
  },
  onItemOnce: (node: any, type: string, callback: Function) => {
    node.addEventListener(type, function (e) {
      e.target.removeEventListener(e.type, <EventListener>arguments.callee);
      return callback(arguments);
    });
  },
  onItem: (node: HTMLElement, type: string, callback: EventListener) => {
    node.addEventListener(type, callback, false);
    return {
      off: () => {return node.removeEventListener(type, callback, false)}
    }
  }

}
