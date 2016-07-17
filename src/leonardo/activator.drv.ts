import ICompileService = angular.ICompileService;
import IDirective = angular.IDirective;
import IAugmentedJQuery = angular.IAugmentedJQuery;
import IScope = angular.IScope;
import IDocumentService = angular.IDocumentService;


export function leoActivator($compile: ICompileService, leoStorage: Storage): IDirective {

  return {
    restrict: 'A',
    controllerAs: 'leonardo',
    controller: LeoActivator,
    bindToController: true,
    link: function (scope: IScope, elem: IAugmentedJQuery) {
      const position = leoStorage.getSavedPosition(),
      positionStr = position ? `style="top: ${position.top}px; left: ${position.left}px; right: initial; bottom: initial;"` : '',
        el = angular.element(`<div ${positionStr}  ng-click="leonardo.activate()" class="leonardo-activator" ng-if="leonardo.isLeonardoVisible"><div ng-mousedown="leonardo.drag($event)" class="leonardo-draggable"></div></div>`),
        win = angular.element([
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
leoActivator.$inject = ['$compile', 'leoStorage'];

class LeoActivator {
  isLeonardoVisible = true;
  isLeonardoWindowVisible = false;
  activeTab = 'scenarios';
  dragging: boolean = false;
  static $inject = ['$scope', '$document', '$timeout', 'leoStorage'];

  constructor($scope, private $document, private $timeout, private leoStorage: Storage) {
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
    if (this.dragging) {
      this.dragging = false;
      return;
    }
    this.isLeonardoWindowVisible = !this.isLeonardoWindowVisible;
    if (this.isLeonardoWindowVisible) {
      this.$timeout(() => {
        this.$document[0].getElementById('filter').focus();
      }, 0);
    }
  }

  drag(event) {
    let _elem = angular.element(event.target.parentNode),
      doc = angular.element(document),
      move = divMove.bind(this),
      up = mouseUp.bind(this);
    doc.on('mousemove', move);
    doc.on('mouseup', up);
    function divMove(e) {
      this.dragging = true;
      _elem.css('right', 'initial');
      _elem.css('bottom', 'initial');
      _elem.css('top', e.clientY + 'px');
      _elem.css('left', e.clientX + 'px');
    }​
    function mouseUp(e) {
      doc.off('mousemove', move);
      this.leoStorage.setSavedPosition({left: e.clientX, top: e.clientY});
    }
  }
}
