import IDirective = angular.IDirective;

export function leoSelect(): IDirective {
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
  }
}

class LeoSelectController {
  private entityId;
  private static count = 0;
  private open;
  private scope;
  private state;
  onChange: Function;
  onDelete: Function;
  disabled: Function;

  static $inject = ['$document', '$scope'];

  constructor(private $document, private $scope) {
    this.entityId = ++LeoSelectController.count;
    this.open = false;
    this.scope = null;
  }

  selectOption($event, option) {
    $event.preventDefault();
    $event.stopPropagation();
    this.state.activeOption = option;
    this.open = false;
    this.onChange({state: this.state});
  };

  removeOption($event, option) {
    $event.preventDefault();
    $event.stopPropagation();
    this.onDelete({state: this.state, option: option});
  };

  toggle($event) {
    if (!this.disabled()) this.open = !this.open;
    if (this.open) this.attachEvent();
  };

  clickEvent(event) {
    var className = event.target.getAttribute('class');
    if (!className || className.indexOf('leo-dropdown-entity-' + this.entityId) == -1) {
      this.$scope.$apply(() => {
        this.open = false;
      });
      this.removeEvent();
    }
  }

  attachEvent() {
    this.$document.bind('click', this.clickEvent.bind(this));
  };

  removeEvent() {
    this.$document.unbind('click', this.clickEvent);
  };
}
