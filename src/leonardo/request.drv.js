angular.module('leonardo').directive('leoRequest', function () {
  return {
    restrict: 'E',
    templateUrl: 'request.html',
    replace: true,
    scope: {
      request: '=',
      onSelect: '&'
    },
    controller: ['$scope', function ($scope) {
      $scope.select = function () {
        $scope.onSelect();
      }
    }]
  }
});
