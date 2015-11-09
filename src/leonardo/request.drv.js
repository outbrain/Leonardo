angular.module('leonardo').directive('leoRequest', function () {
  return {
    restrict: 'E',
    templateUrl: 'request.html',
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
