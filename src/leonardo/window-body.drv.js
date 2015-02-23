// This Is A Header
// ----------------


// This is a normal comment, that will become part of the
// annotations after running through the Docco tool. Use this
// space to describe the function or other code just below
// this comment. For example:
//
// The `DoSomething` method does something! It doesn't take any
// parameters... it just does something.
function windowBodyDirective($http, configuration) {
  return {
    restrict: 'E',
    templateUrl: 'window-body.html',
    scope: true,
    replace: true,
    controller: function($scope){
      $scope.states = configuration.states.map(state => angular.copy(state));
      $scope.states.forEach(state => state.options
                   .forEach(option => option.active = true));
      $scope.selectedItem = 'activate';
    },
    link: function(scope) {
      scope.submit = function(value){
        if (value) {
          $http.get(value).success(function (res) {
            scope.value = res;
          });
        }
      };
    }
  };
}

export default windowBodyDirective