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

LeoSelectController.count = 0;
function LeoSelectController() {
  this.entityId = ++LeoSelectController.count;
  this.open = false;

  this.selectOption = function(option) {
    this.state.activeOption = option;
    this.open = false;
    this.onChange({state: this.state});
  }.bind(this);

  this.removeOption = function(option) {
    this.onDelete({state: this.state, option: option});
  }.bind(this);

  this.toggle = function() {
    if (!this.disabled()) this.open = !this.open;
    if (this.open) attachEvent();
    }.bind(this);

  var clickEvent = function(event) {
    console.log(event);
    //removeEvent();
  }.bind(this);

  var attachEvent = function() {
    document
        .querySelector('body')
        .addEventListener('click', clickEvent);
  }.bind(this);

  var removeEvent = function() {
    document
        .getElementById('body')
        .removeEventListener('click', clickEvent);
  };
}