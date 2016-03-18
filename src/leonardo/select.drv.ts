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
    controllerAs: 'leoSelect',
    link: function(scope, elm, attr, ctrl) {
      ctrl.setScope(scope);
    }
  }
}]);

LeoSelectController.count = 0;
LeoSelectController.$inject = ['$document'];
function LeoSelectController($document) {
  var self = this;
  this.entityId = ++LeoSelectController.count;
  this.open = false;
  this.scope = null;

  this.setScope = function(scope) {
    self.scope = scope;
  };

  this.selectOption = function($event, option) {
    $event.preventDefault();
    $event.stopPropagation();
    self.state.activeOption = option;
    self.open = false;
    self.onChange({state: self.state});
  };

  this.removeOption = function(option) {
    self.onDelete({state: self.state, option: option});
  };

  this.toggle = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    if (!self.disabled()) self.open = !self.open;
    if (self.open) attachEvent();
  };

  var clickEvent = function(event) {
    var className = event.target.getAttribute('class');
    if (!className || className.indexOf('leo-dropdown-entity-'+self.entityId) == -1) {
      self.scope.$apply(function() {
        self.open = false;
      });
      removeEvent();
    }
  };

  var attachEvent = function() {
    $document.bind('click', clickEvent);
  };

  var removeEvent = function() {
    $document.unbind('click', clickEvent);
  };
}