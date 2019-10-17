import {} from 'jasmine';
import {leoConfiguration, IState} from './configuration.srv'

const generateState = ({
  name = "Create Character",
  url =  "/character",
  verb = "POST",
  options = [
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
}:IState) :IState => {

  return {
    name,
    url,
    verb,
    options
  }
};

describe('configurations', function() {
  it('should add a state', function() {
    var leo = leoConfiguration();

    leo.addState(generateState({} as IState), false);

    var states = leo.getStates();
    expect(states.length).toBe(1);
  });

  it('should add two different states', function() {
    var leo = leoConfiguration();

    leo.addStates([
      generateState({name: "logout"} as IState),
      generateState({} as IState)
    ]);

    var states = leo.getStates();
    expect(states.length).toBe(2);
  });

  it('should merge two similar states', function() {
    var leo = leoConfiguration();

    const state = generateState({name: "logout"} as IState);

    leo.addStates([
      state,
      state
    ]);

    var states = leo.getStates();
    expect(states.length).toBe(1);
  });

  it('should remove a state', function() {
    var leo = leoConfiguration();

    const state = generateState({name: "logout"} as IState);

    leo.addState(state, false);
    leo.removeState(state);

    var states = leo.getStates();
    expect(states.length).toBe(0);
  });
});
