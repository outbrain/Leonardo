export function leoStateItem () {
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
}

class LeoStateItem {
  private state;
  public onToggleClick: Function;
  public onRemoveState: Function;
  public onRemoveOption: Function;
  public onOptionChanged: Function;

  toggleClick ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.onToggleClick({
      state: this.state
    });
  };

  removeState ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.onRemoveState({
      state: this.state
    });
  };

  removeOption (state, option) {
    this.onRemoveOption({
      state: state,
      option: option
    });
  };

  updateState (state) {
    this.onOptionChanged({
      state: state
    });
  }
}
