/* global angular */

(function (module) {
  "use strict";

  try {
    module = angular.module('stateRouterScenario');
  } catch (e) {
    module = angular.module('stateRouterScenario', ['ui.router']);
  }

  module.run(function ($window, $httpBackend) {
    if (!$window.localStorage.leonardoMock) {
      $httpBackend.whenGET(new RegExp('/')).passThrough();
      $httpBackend.whenPOST(new RegExp('/')).passThrough();
      $httpBackend.whenGET = function () {
        return {
          passThrough: function () {},
          respond: function () {}
        };
      };
      $httpBackend.whenPOST = function () {
        return {
          passThrough: function () {},
          respond: function () {}
        };
      };
    }
  });

  module.provider('srsManager', function () {
    var that = this;
    this.items = angular.fromJson(localStorage.getItem('activeScenarios') || '[]');
    this.items.remove = function (domain, name) {
      var items = this.filter(function (item) {
        return !(item.domain === domain && item.name === name);
      });
      this.splice(0, this.length);
      items.forEach(function (item) {
        this.push(item);
      }, this);
    };

    this.items.contains = function (domain, name) {
      return this.some(function (item) {
        if (item.domain === domain && item.name === name) {
          return true;
        }
      });
    };

    this.items.place = function (domain, name, selected) {
      if (!selected) {
        this.remove(domain, name);
      }
      else if (name !== 'default' && !this.contains(domain, name)) {
        this.push({
          domain: domain,
          name: name
        });
      }
    };

    this.init = function (list) {
      this.list = list;
    };

    this.$get = ['$rootScope', '$log', '$state', '$modal', '$window', function ($rootScope, $log, $state, $modal, $window) {

      var modalInstance;
      var generateModal = function () {
        modalInstance = $modal.open({
          templateUrl: 'templates/modalContent.html',
          controller: ['$scope', '$state', '$modalInstance', function ($scope, $state, $modalInstance) {

            $scope.vm = {
              leonardoMock: $window.localStorage.leonardoMock === "true"
            };

            $scope.$watch('vm.leonardoMock', function (value, oldValue) {
              if (angular.isDefined(value) && value !== oldValue) {
                if (!value) {
                  delete $window.localStorage.leonardoMock;
                }
                else {
                  $window.localStorage.leonardoMock = true;
                }
                $window.location.reload();
              }
            });

            $scope.items = that.list.reduce(function (prev, current) {
              if (current.state && !$state.includes(current.state)) {
                return prev;
              }

              return prev.concat(current.options.map(function (option) {
                if (option.items) {
                  var title = option.title;
                  option = option.items;
                  option.title = title;
                }
                else {
                  option = [option];
                }

                var selected = 'default';
                var res = option.map(function (item) {
                  var sel = that.items.contains(current.domain, item.name);
                  if (sel) {
                    selected = item.name;
                  }

                  return {
                    text: item.text,
                    name: item.name,
                    selected: sel
                  };
                });
                res.domain = current.domain;
                res.selected = selected;
                res.title = option.title;
                return res;
              }));
            }, []);

            $scope.ok = function () {
              $scope.items.forEach(function (item) {
                if (item.length === 1) {
                  that.items.place(item.domain, item[0].name, item[0].selected);
                }
                else {
                  item.forEach(function (subItem) {
                    that.items.place(item.domain, subItem.name, false);
                  });

                  if (item.selected) {
                    that.items.place(item.domain, item.selected, true);
                  }
                }
              });

              localStorage.setItem('activeScenarios', angular.toJson(that.items));
              $modalInstance.close($scope.items);
            };

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
          }]
        });

        modalInstance.result.then(function (res) {
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

      function getResponse(def) {
        if (typeof def === 'string') {
          def = def.split(':');
          var request = new XMLHttpRequest();

          request.open('GET', '/js/selfserve/engage/dev/local-app/mock/data' + def[1], false);
          request.send(null);

          return [def[0], request.response];
        }
        else if (def instanceof Array) {
          return def;
        }
        else {
          def();
        }
      }

      return {
        isActive: function (domain, name) {
          return that.items.contains(domain, name);
        },
        generateResponse: function (def, domain, options) {
          options = options || [];
          return options.filter(function (item) {
            return this.isActive(domain, item.scenario);
          }, this).concat([
            {
              response: getResponse(def)
            }
          ])[0].response;
        },
        openModal: function () {
          generateModal();
        }
      };
    }];
  });

})();
(function(module) {
try {
  module = angular.module('stateRouterScenario.templates');
} catch (e) {
  module = angular.module('stateRouterScenario.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/modalContent.html',
    '<div class="modal-header"><h3 class="modal-title">Scenario Config</h3><div class="onoffswitch"><input ng-model="vm.leonardoMock" class="onoffswitch-checkbox" id="leonardoMock" type="checkbox" name="leonardoMock" value="true"><label class="onoffswitch-label" for="leonardoMock"><span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span></label></div></div><div class="modal-body"><ul class="clearfix"><li ng-repeat="item in items" ng-class="{ \'is-group\': item.length > 1 }"><div ng-if="item.length === 1"><label>{{item[0].text}}</label><div class="onoffswitch"><input ng-model="item[0].selected" class="onoffswitch-checkbox" id="{{item[0].name}}" type="checkbox" name="{{item[0].name}}" value="{{item[0].name}}"><label class="onoffswitch-label" for="{{item[0].name}}"><span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span></label></div></div><div ng-if="item.length > 1" class="group"><h4 ng-if="item.title">{{item.title}}</h4><ul class="clearfix"><li><label>Default</label><input ng-model="item.selected" type="radio" name="multi_{{$parent.$index}}" value="default"></li><li ng-repeat="subItem in item"><label>{{subItem.text}}</label><input ng-model="item.selected" type="radio" name="multi_{{$parent.$index}}" value="{{subItem.name}}"></li></ul></div></li></ul></div><div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button> <button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>');
}]);
})();
