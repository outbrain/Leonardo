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
            //$scope.changeActive(state);
        });
        configuration.deactivateAll();
      };

      configuration.fetchStates().then(function(states){

        $scope.states = states;
        $scope.changeActive = function(state){
          console.log("activate: " + state.name + " " + state.active);
          configuration.upsertOption(state.name, state.activeOption.name, state.active);
        };

        //move to on change of the select box
        //

        states.forEach(function(state){
          $scope.$watch(function(){
            return state.activeOption;
          }, function(activeOption, oldValue){
            if (activeOption !== oldValue){
              console.log("select: " + state.name + " " + activeOption.name + " " + state.active);
              configuration.upsertOption(state.name, activeOption.name, state.active);
            }
          });
        });
      });
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
}

export default windowBodyDirective