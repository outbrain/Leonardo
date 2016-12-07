/// <reference path="../leonardo.d.ts" />

export default {
  TOGGLE_LAUNCHER: 'leonardo:toggle:launcher',
  CHANGE_VIEW: 'leonardo:change:view',
  SCENARIO_CLICKED: 'leonardo:scenario:clicked',
  FILTER_STATES: 'leonardo:filter:states',
  CLOSE_DROPDOWNS: 'leonardo:close:dropdowns',
  TOGGLE_STATES: 'leonardo:toggle:states',
  TOGGLE_SCENARIOS: 'leonardo:toggle:scenario',
  ADD_SCENARIO: 'leonardo:add:scenario',
  TOGGLE_STATE: 'leonardo:toggle:states',

  on: (eventName: string, fn: EventListenerOrEventListenerObject) => {
    document.body.addEventListener(eventName, fn);
  },
  dispatch: (eventName: string, details?: any) => {
    const event = new CustomEvent(eventName, { detail: details });
    document.body.dispatchEvent(event);
  }
}
