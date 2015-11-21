angular.module('leonardo').directive('leoRequest', function () {
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
});

function LeoRequest() {
  this.select = function () {
    this.onSelect();
  }
}