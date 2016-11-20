/// <reference path="../leonardo.d.ts" />

export default {
  TOGGLE_LAUNCHER: 'leonardo:toggle:launcher',
  CHANGE_VIEW: 'leonardo:change:view',

  on: (eventName: string, fn: EventListenerOrEventListenerObject) => {
    document.body.addEventListener(eventName, fn);
  },
  dispatch: (eventName: string, details?: any) => {
    const event = new CustomEvent(eventName, { detail: details });
    document.body.dispatchEvent(event);
  }
}
