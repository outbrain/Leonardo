angular.module('leonardo').directive('leoActivator', ['$compile', function activatorDirective($compile) {
  return {
    restrict: 'A',
    controllerAs: 'leonardo',
    controller: LeoActivator,
    bindToController: true,
    link: function(scope, elem) {
      var el = angular.element('<div ng-click="leonardo.activate()" class="leonardo-activator" ng-show="leonardo.isLeonardoVisible"></div>');
      var win = angular.element([
      '<div class="leonardo-window">',
        '<div class="leonardo-header">',
          '<div class="menu">',
            '<ul>',
              '<li>LEONARDO</li>',
              '<li ng-class="{ \'leo-selected-tab\': leonardo.activeTab === \'scenarios\' }" ng-click="leonardo.selectTab(\'scenarios\')">Scenarios</li>',
              '<li ng-class="{ \'leo-selected-tab\': leonardo.activeTab === \'recorder\' }" ng-click="leonardo.selectTab(\'recorder\')">Recorder</li>',
              '<li ng-class="{ \'leo-selected-tab\': leonardo.activeTab === \'export\' }" ng-click="leonardo.selectTab(\'export\')">Exported Code</li>',
            '</ul>',
          '</div>',
        '</div>',
        '<leo-window-body></leo-window-body>',
        '</div>',
      '</div>'
      ].join(''));

      $compile(el)(scope);
      $compile(win)(scope);

      elem.append(el);
      elem.append(win);

      win[0].addEventListener( 'webkitTransitionEnd', function() {
        if (!document.body.classList.contains('pull-top')){
          document.body.classList.add("pull-top-closed");
        }
      }, false );
    }
  };
}]);

LeoActivator.$inject = ['$scope', '$document'];
function LeoActivator($scope, $document) {
  this.isLeonardoVisible = true;
  this.activeTab = 'scenarios';

  this.selectTab = function (name) {
    this.activeTab = name;
  };

  $document.on('keypress', function(e) {

    if (e.shiftKey && e.ctrlKey) {
      switch (e.keyCode) {
        case 12:
          this.isLeonardoVisible = !this.isLeonardoVisible;
          break;
        case 11:
          this.activate();
          break;
        default:
          break;
      }
      $scope.$apply();
    }
  }.bind(this));

  this.activate = function() {
    if (!document.body.classList.contains('pull-top')) {
      document.body.classList.add('pull-top');
      document.body.classList.remove('pull-top-closed');
      document.getElementById('filter').focus();
    }
    else {
      document.body.classList.remove('pull-top');
    }
  };
}