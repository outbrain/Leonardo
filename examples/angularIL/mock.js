angular.module('leonardo').run(['leoConfiguration', function (leoConfiguration) {
  leoConfiguration.addStates([
    {
      "name": "Login",
      "url": "/login",
      "verb": "POST",
      "options": [
        {
          "name": "success",
          "status": 200,
          "data": {},
          "delay": 0
        }
      ],
      "active": true,
      "activeOption": {
        "name": "success",
        "status": 200,
        "data": {},
        "delay": 0
      }
    }
  ])
  leoConfiguration.addStates([
    {
      "name": "Create charaters",
      "url": "/characters",
      "verb": "PUT",
      "options": [
        {
          "name": "success",
          "status": 200,
          "data": {},
          "delay": 0
        }
      ],
      "active": true,
      "activeOption": {
        "name": "success",
        "status": 200,
        "data": {},
        "delay": 0
      }
    }
  ])
  leoConfiguration.addStates([
    {
      "name": "Autherise",
      "url": "/auth",
      "verb": "GET",
      "options": [
        {
          "name": "success",
          "status": 200,
          "data": {},
          "delay": 0
        }
      ],
      "active": true,
      "activeOption": {
        "name": "success",
        "status": 200,
        "data": {},
        "delay": 0
      }
    }
  ])
}])


angular.module('leonardo').run(function (leoConfiguration, $rootScope) {
  leoConfiguration.addState({
    name: 'debug',
    options: [
      {name: 'Enabled'}
    ]
  });

  $rootScope.$on('leonardo:setStates', function(){
    var debug = leoConfiguration.getState('debug');
    if (debug) {
      angular.reloadWithDebugInfo();
    }
  });
});
//  leoConfiguration.addStates([
//    {
//      "name": "Characters",
//      "url": "characters",
//      "verb": "POST",
//      "options": [
//        {
//          "name": "ok",
//          "status": 200,
//          "data": {},
//          "delay": 0
//        },
//        {
//          "name": "Failure",
//          "status": "500",
//          "data": {},
//          "delay": 0
//        }
//      ],
//      "active": true,
//      "activeOption": {
//        "name": "ok",
//        "status": 200,
//        "data": {},
//        "delay": 0
//      }
//    }
//  ]);
//}]);