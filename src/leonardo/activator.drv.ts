import ICompileService = angular.ICompileService;
import IDirective = angular.IDirective;
import IAugmentedJQuery = angular.IAugmentedJQuery;
import IScope = angular.IScope;
import IDocumentService = angular.IDocumentService;

export function leoActivator($compile: ICompileService):IDirective {

  return {
    restrict: 'A',
    controllerAs: 'leonardo',
    controller: LeoActivator,
    bindToController: true,
    link: function(scope: IScope, elem: IAugmentedJQuery) {
      var el = angular.element('<div ng-click="leonardo.activate()" class="leonardo-activator" ng-if="leonardo.isLeonardoVisible"></div>');
      var win = angular.element([
      '<div class="leonardo-window" ng-if="leonardo.isLeonardoWindowVisible">',
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

    }
  };
}
leoActivator.$inject = ['$compile'];

class LeoActivator {
  isLeonardoVisible = true;
  isLeonardoWindowVisible = false;
  activeTab = 'scenarios';
  static $inject = ['$scope', '$document', '$timeout'];
  constructor ($scope, private $document, private $timeout) {
    $document.on('keypress', (e) => {

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
    });
  }

  selectTab(name) {
    this.activeTab = name;
  }

  activate() {
    this.isLeonardoWindowVisible = !this.isLeonardoWindowVisible;
    if (this.isLeonardoWindowVisible) {
      this.$timeout(() => {
        this.$document[0].getElementById('filter').focus();
      }, 0);
    }
  }
}
