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

  this.toggleClick = function () {
    self.onToggleClick({
      state: this.state
    });
  }

  this.removeState = function () {
    self.onRemoveState({
      state: this.state
    });
  }

  this.removeOption = function (state, option) {
    self.onRemoveOption({
      state: state,
      option: option
    });
  }
}
