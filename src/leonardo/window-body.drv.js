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
     // $scope.selectedItem = 'activate';

      configuration.getActiveStateOptions().then(function(rows){
        var activeStates = {};
        for(var i = 0; i < rows.length; i++) {
          activeStates[rows.item(i).state] = { name: rows.item(i).name, active: (rows.item(i).active === "true") };
        }

        $scope.states = configuration.states.map(state => angular.copy(state));
        $scope.states.forEach(function(state) {
          let option = activeStates[state.name];
          state.active = !!option && option.active;
          state.activeOption = !!option ? state.options.find(_option => _option.name === option.name) : state.options[0];
        });

        $scope.changeActive = function(state){
          console.log("activate: " + state.name + " " + state.active);
          configuration.upsertOption(state.name, state.activeOption.name, state.active);
        };

        $scope.states.forEach(function(state){
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