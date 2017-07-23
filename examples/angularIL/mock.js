
Leonardo.addStates([
  {
    "name": "Authenticate",
    "url": "/login",
    "verb": "GET",
    "options": [
      {
        "name": "success",
        "status": 200,
        "data": {bla: 'bla'},
        "delay": 0
      }
    ]
  }
]);
Leonardo.addStates([
  {
    "name": "Characters HTML",
    "url": "characters.html",
    "verb": "GET",
    "options": [
      {
        "name": "success",
        "status": 200,
        "data": '<div>test</div>',
        "delay": 0
      }
    ]
  }
]);
Leonardo.addStates([
  {
    "name": "jsonp test",
    "url": "http://ip.jsontest.com/?callback=callback",
    "verb": "JSONP",
    "options": [
      {
        "name": "success",
        "data": {
          x: 1
        },
        "delay": 1000
      },
      {
        "name": "success 2",
        "data": {
          x: 2
        },
        "delay": 5000
      }
    ]
  }
]);

Leonardo.addStates([
  {
    "name": "jsonp test with params",
    "url": "http://ip.jsontest.com/?callback=Obj.middleware.callback&idx=0",
    "jsonpCallback": "Obj.middleware.callback",
    "jsonCallbackAdditionalParams": [0],
    "verb": "JSONP",
    "options": [
      {
        "name": "success",
        "data": {
          x: 1
        },
        "delay": 1
      }
    ]
  }
]);


Leonardo.addStates([
  {
    "name": "Login",
    "url": "/login",
    "verb": "POST",
    "options": [
      {
        "name": "success",
        "status": 200,
        "data": {
          "name": "sagivf frankel"
        }
      },
      {
        "name": "Failure",
        "status": 401,
        "data": {
          "msg": "no no!"
        },
        "delay": 0
      },
      {
        "name": "Login With Delay",
        "status": 200,
        "data": {
          "name": "sagiv frankel"
        },
        "delay": "3000"
      }
    ]
  }
]);

Leonardo.addStates([
  {
    "name": "Fetch Character",
    "url": "/characters",
    "verb": "GET",
    "options": [
      {
        "name": "success empty",
        "status": 200,
        "data": []
      },
      {
        "name": "success",
        "status": 200,
        "data": [
          {
            "type": "turtles",
            "name": "leonardo",
            "image": "https://farm1.staticflickr.com/445/19918490918_562a05b2ae_b.jpg"
          },
          {
            "type": "turtles",
            "name": "donatelo",
            "image": "https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg"
          },
          {
            "type": "enemies",
            "name": "shredder",
            "image": "https://farm1.staticflickr.com/312/20058148116_5be49c9aa2_b.jpg"
          },
          {
            "type": "enemies",
            "name": "bebop",
            "image": "https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg"
          },
          {
            "type": "enemies",
            "name": "rocksteady",
            "image": "https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg"
          },
          {
            "type": "turtles",
            "name": "michelangelo",
            "image": "https://farm1.staticflickr.com/521/20098615082_70dbbb6232_b.jpg"
          },
          {
            "type": "turtles",
            "name": "refael",
            "image": "https://farm1.staticflickr.com/430/19483942244_8a91a5bd32_b.jpg"
          },
          {
            "type": "turtles",
            "name": "donatelo",
            "image": "https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg"
          },
          {
            "type": "turtles",
            "name": "splinter",
            "image": "https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg"
          },
          {
            "type": "enemies",
            "name": "krang",
            "image": "https://farm1.staticflickr.com/502/19909252418_eff51f40ba_b.jpg"
          },
          {
            "type": "enemies",
            "name": "krang",
            "image": "https://farm1.staticflickr.com/526/19918490318_126d63dcde_b.jpg"
          },
          {
            "type": "enemies",
            "name": "rocksteady",
            "image": "https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg"
          }
        ],
        "delay": 0
      }
    ]
  }
]);
Leonardo.addStates([
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

Leonardo.addScenarios([
  {
    name: 'Full flow logged In',
    states: [
      {name: 'Authenticate', option: 'success'},
      {name: 'Auth', option: 'success'},
      {name: 'Fetch Character', option: 'success empty'},
      {name: 'Create Character', option: 'success'}

    ]
  },
  {
    name: 'Full flow logged Out',
    states: [
      {name: 'Login', option: 'Login With Delay'},
      {name: 'Fetch Character', option: 'success empty'},
      {name: 'Create Character', option: 'success'}
    ]
  }
]);

Leonardo.addState({
  name: 'debug',
  options: [
    {name: 'Enabled'}
  ]
});

var debug = Leonardo.getActiveStateOption('debug');
var isDebug = debug && debug.name === 'Enabled';
Leonardo.onStateChange(function () {
  var debug = Leonardo.getActiveStateOption('debug');
  if (!isDebug && debug) {
    angular.reloadWithDebugInfo();
  }
//    var debug = Leonardo.getState('debug');
//    if (!isDebug && debug) {
//      angular.reloadWithDebugInfo();
//    }
});
