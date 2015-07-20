// This Is A Header
// ----------------


// This is a normal comment, that will become part of the
// annotations after running through the Docco tool. Use this
// space to describe the function or other code just below
// this comment. For example:
//
// The `DoSomething` method does something! It doesn't take any
// parameters... it just does something.
angular.module('leonardo').directive('leoWindowBody', function windowBodyDirective($http, leoConfiguration) {
  return {
    restrict: 'E',
    templateUrl: 'window-body.html',
    scope: true,
    replace: true,
    controller: function($scope){
      $scope.selectedItem = 'activate';
      $scope.NothasUrl = function(option){
        return !option.url;
      };
      $scope.hasUrl = function(option){
        return !!option.url;
      };

      $scope.deactivate = function() {
        $scope.states.forEach(function(state){
            state.active = false;
        });
        leoConfiguration.deactivateAll();
      };

      $scope.updateState = function(state){
        console.log(`update state: ${state.name} ${state.activeOption.name} ${state.active}`);
        leoConfiguration.upsertOption(state.name, state.activeOption.name, state.active);
      };

      $scope.states = leoConfiguration.fetchStates();

      $scope.scenarios = leoConfiguration.getScenarios();

      $scope.activateScenario = function(scenario){
        $scope.activeScenario = scenario;
        leoConfiguration.setActiveScenario(scenario);
        $scope.states = leoConfiguration.fetchStates();
      };
    },
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
    }
  };
});
