angular.module('leonardo').directive('leoStateItem', function () {
  return {
    restrict: 'E',
    templateUrl: 'state-item.html',
    scope: {
      state: '=',
      ajaxState: '=',
      onOptionChanged: '&',
      onRemoveState: '&',
      onRemoveOption: '&',
      onToggleClick: '&'
    },
    controllerAs: 'leoStateItem',
    bindToController: true,
    controller: LeoStateItem
  };
});

function LeoStateItem() {
  var self = this;

  this.toggleClick = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    self.onToggleClick({
      state: self.state
    });
  };

  this.removeState = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    self.onRemoveState({
      state: this.state
    });
  };

  this.removeOption = function (state, option) {
    self.onRemoveOption({
      state: state,
      option: option
    });
  };

  this.updateState = function (state) {
    self.onOptionChanged({
      state: state
    });
  }
}
