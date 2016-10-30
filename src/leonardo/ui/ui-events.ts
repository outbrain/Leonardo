/// <reference path="../leonardo.d.ts" />

export default {
  TOGGLE_VIEW: 'leonardo:toggle:view',
  
  on: (eventName: string, fn: EventListenerOrEventListenerObject) => {
    document.body.addEventListener(eventName, fn);
  },
  dispatch: (eventName: string, details?: any) => {
    const event = new CustomEvent(eventName, details);
    document.body.dispatchEvent(event);
  }
}
