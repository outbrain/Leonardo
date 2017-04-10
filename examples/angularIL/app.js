//<!-- if dev -->

function callback(data) {
  console.log('jsonp callback fired', data);
}

window['Obj'] = {
  'middleware': {
    'callback': function (data, ...params) {console.log('jsonp callback with multi params fired', data, ...params)}
  }
};

angular.module('angular-il', ['ui.router'])
//<!-- else -->
//angular.module('angular-il', ['ui.router'])
  .config(['$compileProvider','$urlRouterProvider','$stateProvider','types','charactersList',
    function ($compileProvider, $urlRouterProvider, $stateProvider, types, charactersList) {
    $compileProvider.debugInfoEnabled(false);

    $urlRouterProvider.otherwise(function ($injector) {
      var $state = $injector.get('$state');
      var $http = $injector.get('$http');
      var $rootScope = $injector.get('$rootScope');
      $http.get('/login').then(function(res){
        $rootScope.user = res.data ? res.data.name : '';
        $state.go('characters');
      }).catch(function(){
        $state.go('login');
      });
    });

    $stateProvider
      .state('login', {
        templateUrl: 'login.html',
        controllerAs: 'login',
        controller: ['$rootScope', '$http', '$state', function ($rootScope, $http, $state) {
          this.login = function () {
            $rootScope.loading = true;
            $http({
              method: 'POST',
              url: '/login'
            }).then(function (res) {
              $rootScope.error = null;
              $rootScope.user = res.data ? res.data.name : '';
              $state.go('characters');
            }.bind(this)).catch(function(res){
              $rootScope.error = 'Failed to login' + ((res.data && res.data.msg && (': ' + res.data.msg) ) || '');
            }).finally(function(){
              $rootScope.loading = false;
            });
          }
        }]
      })
      .state('characters', {
        templateUrl: 'characters.html',
        controllerAs: 'characters',
        controller: ['$rootScope', '$http', '$state', '$scope', 'characters', function($rootScope, $http, $state, $scope, characters) {
          this.type = 'turtles';
          this.size = 'big';
          if (characters instanceof Array) {
            this.list = characters;
          }
          else {
            this.list = [];
            this.error = characters;
          }

          this.fireJsonp = function() {
            $http.jsonp('http://ip.jsontest.com/?callback=callback');
          };

          this.fireJsonpParams = function() {
            $http.jsonp('http://ip.jsontest.com/?callback=Obj.middleware.callback&idx=0');
          };

          this.create = function () {

            $rootScope.loading = true;
            $http({
              url: '/character',
              method: 'POST'
            }).then(function () {
              $rootScope.error = null;
              this.error = false;
              this.list.push({
                type: this.type,
                name: this.name,
                image: charactersList[this.name][this.size].splice(0, 1)[0]
              });
            }.bind(this)).catch(function(res){
              $rootScope.error = 'Failed to create character' + ((res.data && res.data.msg && (': ' + res.data.msg) ) || '');
            }).finally(function(){
              $rootScope.loading = false;
            });
          };

          this.complete = function () {
            $state.go('complete');
          };

          $scope.$watch(function () {
            return this.type;
          }.bind(this), function (value) {
            this.names = types[value];
            this.name = this.names[0];
          }.bind(this));
        }],
        resolve: {
          characters: ['$http', function ($http) {
            return $http.get('/characters').then(function(res){
              return res.data;
            }).catch(function (res) {
              return (res.data && res.data.msg) || res.status;
            });
          }]
        }
      })
      .state('complete', {
        templateUrl: 'complete.html',
        controller: ['$scope', '$timeout', function ($scope, $timeout) {
          $timeout(function () {
            $scope.done = true;
          }, 20);
        }]
      });
  }])
  .constant('types',   {
    turtles: ['leonardo', 'donatelo', 'michelangelo', 'refael', 'splinter'],
    enemies: ['shredder', 'krang', 'bebop', 'rocksteady']
  })
  .constant('charactersList',  {
    leonardo: {
      small: [
        'https://farm4.staticflickr.com/3718/19896162428_4d70df22b9_b.jpg',
        'https://farm4.staticflickr.com/3718/19896162428_4d70df22b9_b.jpg',
        'https://farm4.staticflickr.com/3718/19896162428_4d70df22b9_b.jpg',
        'https://farm4.staticflickr.com/3718/19896162428_4d70df22b9_b.jpg',
        'https://farm4.staticflickr.com/3718/19896162428_4d70df22b9_b.jpg'
      ],
      big: [
        'https://farm1.staticflickr.com/445/19918490918_562a05b2ae_b.jpg',
        'https://farm1.staticflickr.com/445/19918490918_562a05b2ae_b.jpg',
        'https://farm1.staticflickr.com/445/19918490918_562a05b2ae_b.jpg',
        'https://farm1.staticflickr.com/445/19918490918_562a05b2ae_b.jpg',
        'https://farm1.staticflickr.com/445/19918490918_562a05b2ae_b.jpg'
      ]
    },
    donatelo: {
      big: [
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg',
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg',
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg',
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg',
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg',
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg'
      ],
      small: [
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg',
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg',
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg',
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg',
        'https://farm1.staticflickr.com/402/19896041068_3b3c6a45e9_b.jpg'
      ]
    },
    michelangelo: {
      big: [
        'https://farm1.staticflickr.com/315/19483948404_9147179e8e_b.jpg',
        'https://farm1.staticflickr.com/315/19483948404_9147179e8e_b.jpg',
        'https://farm1.staticflickr.com/315/19483948404_9147179e8e_b.jpg',
        'https://farm1.staticflickr.com/315/19483948404_9147179e8e_b.jpg',
        'https://farm1.staticflickr.com/315/19483948404_9147179e8e_b.jpg'
      ],
      small: [
        'https://farm1.staticflickr.com/521/20098615082_70dbbb6232_b.jpg',
        'https://farm1.staticflickr.com/521/20098615082_70dbbb6232_b.jpg',
        'https://farm1.staticflickr.com/521/20098615082_70dbbb6232_b.jpg',
        'https://farm1.staticflickr.com/521/20098615082_70dbbb6232_b.jpg',
        'https://farm1.staticflickr.com/521/20098615082_70dbbb6232_b.jpg'
      ]
    },
    refael: {
      small: [
        'https://farm1.staticflickr.com/430/19483942244_8a91a5bd32_b.jpg',
        'https://farm1.staticflickr.com/328/20054214406_5a0800532b_b.jpg',
        'https://farm1.staticflickr.com/328/20054214406_5a0800532b_b.jpg',
        'https://farm1.staticflickr.com/328/20054214406_5a0800532b_b.jpg',
        'https://farm1.staticflickr.com/328/20054214406_5a0800532b_b.jpg',
        'https://farm1.staticflickr.com/328/20054214406_5a0800532b_b.jpg'
      ],
      big: [
        'https://farm1.staticflickr.com/286/19918570140_626580ce9d_b.jpg',
        'https://farm1.staticflickr.com/286/19918570140_626580ce9d_b.jpg',
        'https://farm1.staticflickr.com/286/19918570140_626580ce9d_b.jpg',
        'https://farm1.staticflickr.com/286/19918570140_626580ce9d_b.jpg',
        'https://farm1.staticflickr.com/286/19918570140_626580ce9d_b.jpg'
      ]
    },
    splinter: {
      small: [
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg'
      ],
      big: [
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg',
        'https://farm1.staticflickr.com/519/19483953394_449e8942ff_b.jpg'
      ]
    },
    shredder: {
      small: [
        'https://farm1.staticflickr.com/312/20058148116_5be49c9aa2_b.jpg',
        'https://farm1.staticflickr.com/312/20058148116_5be49c9aa2_b.jpg',
        'https://farm1.staticflickr.com/312/20058148116_5be49c9aa2_b.jpg',
        'https://farm1.staticflickr.com/312/20058148116_5be49c9aa2_b.jpg',
        'https://farm1.staticflickr.com/312/20058148116_5be49c9aa2_b.jpg'
      ],
      big: [
        'https://farm1.staticflickr.com/312/20058148116_5be49c9aa2_b.jpg',
        'https://farm1.staticflickr.com/323/20106588825_b30649c209_b.jpg',
        'https://farm1.staticflickr.com/323/20106588825_b30649c209_b.jpg',
        'https://farm1.staticflickr.com/323/20106588825_b30649c209_b.jpg',
        'https://farm1.staticflickr.com/323/20106588825_b30649c209_b.jpg',
        'https://farm1.staticflickr.com/323/20106588825_b30649c209_b.jpg'
      ]
    },
    krang: {
      small: [
        'https://farm1.staticflickr.com/502/19909252418_eff51f40ba_b.jpg',
        'https://farm1.staticflickr.com/502/19909252418_eff51f40ba_b.jpg',
        'https://farm1.staticflickr.com/502/19909252418_eff51f40ba_b.jpg',
        'https://farm1.staticflickr.com/502/19909252418_eff51f40ba_b.jpg',
        'https://farm1.staticflickr.com/502/19909252418_eff51f40ba_b.jpg',
        'https://farm1.staticflickr.com/502/19909252418_eff51f40ba_b.jpg'
      ],
      big: [
        'https://farm1.staticflickr.com/526/19918490318_126d63dcde_b.jpg',
        'https://farm1.staticflickr.com/526/19918490318_126d63dcde_b.jpg',
        'https://farm1.staticflickr.com/526/19918490318_126d63dcde_b.jpg',
        'https://farm1.staticflickr.com/526/19918490318_126d63dcde_b.jpg',
        'https://farm1.staticflickr.com/526/19918490318_126d63dcde_b.jpg'
      ]
    },
    bebop: {
      small: [
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg',
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg',
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg',
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg',
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg'
      ],
      big: [
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg',
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg',
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg',
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg',
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg',
        'https://farm1.staticflickr.com/296/19918567750_b21855337c_b.jpg'
      ]
    },
    rocksteady: {
      small: [
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg',
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg',
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg',
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg',
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg'
      ],
      big: [
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg',
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg',
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg',
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg',
        'https://farm1.staticflickr.com/308/19919891449_8267e93e5c_b.jpg'
      ]
    }
  });