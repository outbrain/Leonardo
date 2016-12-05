import IDirective = angular.IDirective;

export function leoRequest ():IDirective {
  return {
    restrict: 'E',
    templateUrl: 'request.html',
    scope: {
      request: '=',
      onSelect: '&'
    },
    controllerAs: 'leoRequest',
    bindToController: true,
    controller: LeoRequest
  };
};

class LeoRequest {
  onSelect:Function;

  select() {
    this.onSelect();
  }
}
