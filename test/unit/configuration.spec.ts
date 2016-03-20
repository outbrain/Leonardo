/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
import { leoConfiguration } from '../../src/leonardo/configuration.srv'

describe('addStates', function() {

  it('should add a state', function() {
    var leo = leoConfiguration({
      getStates: () => []
    }, {
      $broadcast: () => {}
    });

    leo.addStates([
      {
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
      }
    ]);

    var states = leo.getStates();
    expect(states.length).toBe(1);
  });
});