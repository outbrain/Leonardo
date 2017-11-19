/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
import { leoConfiguration } from '../../src/leonardo/configuration.srv'

const genericState = {
  "name": "Create Character",
  "url": "/character",
  "verb": "POST",
  "options": [
    {
      "name": "success",
      "status": 200,
      "data": {},
      "delay": "2500"
    },
    {
      "name": "Failure",
      "status": "500",
      "data": {
        "msg": "you have a crappy server"
      },
      "delay": "2000"
    }
  ]
};

describe('addStates', function() {
  it('should add a state', function() {
    var leo = leoConfiguration();

    leo.addStates([genericState]);

    var states = leo.getStates();
    expect(states.length).toBe(1);
  });

  it('should remove a state', function() {
    var leo = leoConfiguration();

    leo.addStates([genericState]);
    leo.removeState(genericState);

    var states = leo.getStates();
    expect(states.length).toBe(0);
  });
});
