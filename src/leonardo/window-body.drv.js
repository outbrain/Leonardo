angular.module('leonardo').directive('leoWindowBody',
    ['$http', 'leoConfiguration', function windowBodyDirective($http, leoConfiguration) {
  return {
    restrict: 'E',
    templateUrl: 'window-body.html',
    scope: true,
    replace: true,
    controller: ['$scope', function($scope) {
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

      $scope.unregisteredStates = leoConfiguration.getRequestsLog();
      $scope.detail = {
        stringValue: '',
        value: {
          asdasd: "Asd"
        }
      };

      $scope.$watch('detail.value', function(value){
        try {
          $scope.detail.stringValue = JSON.stringify(value, null, 4);
          $scope.detail.error = '';
        }
        catch (e) {
          $scope.detail.error = e.message;
        }
      });

      $scope.$watch('detail.stringValue', function(value){
        try {
          $scope.detail.value = JSON.parse(value);
          $scope.detail.error = '';
        }
        catch(e) {
          $scope.detail.error = e.message;
        }
      });
    }],
    link: function(scope) {
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

      scope.saveState = function (state) {
        console.log('saveState');
      };
    }
  };
}]);

angular.module('leonardo').directive('unregisteredState', function () {
  return {
    restrict: 'E',
    templateUrl: 'unregistered-state.html',
    controller: function ($scope) {
      console.log($scope);
      $scope.saveUnregisteredState = function (state) {
        console.log('saveUnregisteredState');
        $scope.saveState();
      };
    }
  }
});
