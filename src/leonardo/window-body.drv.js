angular.module('leonardo').directive('leoWindowBody',
    ['$http', 'leoConfiguration', '$timeout', function windowBodyDirective($http, leoConfiguration, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'window-body.html',
    scope: true,
    replace: true,
    require: '^leoActivator',
    controller: ['$scope', function($scope) {
      $scope.detail = {};

      $scope.NothasUrl = function (option) {
        return !option.url;
      };
      $scope.hasUrl = function (option) {
        return !!option.url;
      };

      $scope.deactivate = function () {
        $scope.states.forEach(function (state) {
          state.active = false;
        });
        leoConfiguration.deactivateAllStates();
      };

      $scope.updateState = function (state) {
        if (state.active) {
          console.log('activate state option:' + state.name + ': ' + state.activeOption.name);
          leoConfiguration.activateStateOption(state.name, state.activeOption.name);
        } else {
          console.log('deactivating state: ' + state.name);
          leoConfiguration.deactivateState(state.name);
        }
      };

      $scope.states = leoConfiguration.getStates();

      $scope.scenarios = leoConfiguration.getScenarios();

      $scope.activateScenario = function (scenario) {
        $scope.activeScenario = scenario;
        leoConfiguration.setActiveScenario(scenario);
        $scope.states = leoConfiguration.getStates();
      };

      $scope.requests = leoConfiguration.getRequestsLog();

      $scope.$watch('detail.value', function(value){
        if (!value) {
          return;
        }
        try {
          $scope.detail.stringValue = value ? JSON.stringify(value, null, 4) : '';
          $scope.detail.error = '';
        }
        catch (e) {
          $scope.detail.error = e.message;
        }
      });

      $scope.$watch('detail.stringValue', function(value){
        try {
          $scope.detail.value = value ? JSON.parse(value) : {};
          $scope.detail.error = '';
        }
        catch(e) {
          $scope.detail.error = e.message;
        }
      });

      $scope.requestSelect = function (request) {
        $scope.requests.forEach(function (request) {
          request.active = false;
        });

        request.active = true;

        if (request.state && request.state.name) {
          var optionName = request.state.name + ' option ' + request.state.options.length;
        }

        angular.extend($scope.detail, {
          state : (request.state && request.state.name) || '',
          option: optionName || '',
          delay: 0,
          status: 200,
          stateActive: !!request,
          value: request.data || {}
        });
        $scope.detail._unregisteredState = request;
      };

      $scope.$on('leonardo:stateChanged', function(event, stateObj) {
        $scope.states = leoConfiguration.getStates();

        var state = $scope.states.filter(function(state){
          return state.name === stateObj.name;
        })[0];

        if (state) {
          state.highlight = true;
          $timeout(function(){
            state.highlight = false;
          }, 1000);
        }
      });

    }],
    link: function(scope, el, attr, leoActivator) {
      scope.saveUnregisteredState = function () {
        var stateName = scope.detail.state;

        leoConfiguration.addSavedState({
          name: stateName,
          verb: scope.detail._unregisteredState.verb,
          url: scope.detail._unregisteredState.url,
          options: [
            {
              name: scope.detail.option,
              status: scope.detail.status,
              data: scope.detail.value
            }
          ]
        });

        leoActivator.selectTab('scenarios');
      };


      scope.test = {
        url: '',
        value: undefined
      };

      scope.submit = function(url){
        scope.test.value = undefined;
        scope.url = url;
        if (url) {
          $http.get(url).success(function (res) {
            scope.test.value = res;
          });
        }
      };
    }
  };
}]);

angular.module('leonardo').directive('request', function () {
  return {
    restrict: 'E',
    templateUrl: 'request.html',
    replace: true,
    scope: {
      request: '=',
      onSelect: '&'
    },
    controller: function ($scope) {
      $scope.select = function () {
        $scope.onSelect();
      }
    }
  }
});
