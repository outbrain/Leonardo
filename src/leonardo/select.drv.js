angular.module('leonardo').directive('leoSelect', [function leoSelectDirective() {
  return {
    restrict: 'E',
    templateUrl: 'select.html',
    scope: {
      state: '=',
      onChange: '&',
      onDelete: '&',
      disabled: '&'
    },
    controller: LeoSelectController,
    bindToController: true,
    controllerAs: 'leoSelect'
  }
}]);

function LeoSelectController() {
  this.open = false;

  this.selectOption = function(option) {
    this.state.activeOption = option;
    this.open = false;
    this.onChange({state: this.state});
  }.bind(this);

  this.removeOption = function(option) {
    //this.state.activeOption = option;
    this.onDelete({state: this.state});
  }.bind(this);

}