




//angular.module('leonardo').run(function (leoConfiguration, $rootScope) {
//  leoConfiguration.addState({
//    name: 'debug',
//    options: [
//      {name: 'Enabled'}
//    ]
//  });
//
//  $rootScope.$on('leonardo:setStates', function(){
//    var debug = leoConfiguration.getState('debug');
//    if (debug) {
//      angular.reloadWithDebugInfo();
//    }
//  });
//});


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


//[
//  {
//    "type": "freind",
//    "size": "large",
//    "image": "https://farm1.staticflickr.com/502/19909252418_eff51f40ba_b.jpg"
//  }
//]