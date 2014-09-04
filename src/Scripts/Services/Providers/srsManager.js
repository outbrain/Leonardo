(function(module) {
  try {
    module = angular.module('stateRouterScenario');
  } catch (e) {
    module = angular.module('stateRouterScenario', ['ui.router']);
  }

  module.run(function($window, $httpBackend){
    if ($window.localStorage.leonardoPassThrough) {
      $httpBackend.whenGET(new RegExp('/')).passThrough();
      $httpBackend.whenPOST(new RegExp('/')).passThrough();
      $httpBackend.whenGET = function(){
        return {
          passThrough: function(){},
          respond: function(){}
        };
      };
      $httpBackend.whenPOST = function(){
        return {
          passThrough: function(){},
          respond: function(){}
        };
      };
    }
  });

  module.provider('srsManager', function(){
    var that = this;
    this.items = angular.fromJson(localStorage.getItem('activeScenarios') || '[]');
    this.items.remove = function(domain, name){
      var items = this.filter(function(item){
        return !(item.domain === domain && item.name === name);
      });
      this.splice(0, this.length);
      items.forEach(function(item) {
        this.push(item);
      },this);
    };

    this.items.contains = function(domain, name){
      return this.some(function(item) {
        if (item.domain === domain && item.name === name) {
          return true;
        }
      });
    };

    this.items.place = function(domain, name, selected){
      if (!selected){
        this.remove(domain, name);
      }
      else if (name !== 'default' && !this.contains(domain, name)){
        this.push({
          domain: domain,
          name: name
        });
      }
    };

    this.init = function(list){
      this.list = list;
    };

    this.$get = ['$rootScope', '$log', '$state', '$modal', '$window', function ($rootScope, $log, $state, $modal, $window) {

      var modalInstance;
      var generateModal = function(){
        modalInstance = $modal.open({
          templateUrl: 'templates/modalContent.html',
          controller: ['$scope', '$state', '$modalInstance', function ($scope, $state, $modalInstance) {

            $scope.vm = {
              passThrough: !$window.localStorage.leonardoPassThrough
            };

            $scope.$watch('vm.passThrough', function(value, oldValue){
              if (angular.isDefined(value) && value !== oldValue) {
                if (value) {
                  delete $window.localStorage.leonardoPassThrough;
                }
                else {
                  $window.localStorage.leonardoPassThrough = true;
                }
                $window.location.reload();
              }
           });

            $scope.items = that.list.reduce(function(prev, current){
              if (!$state.includes(current.state)) {
                return prev;
              };

              return prev.concat(current.options.map(function(option){
                if (option.items){
                  var title = option.title;
                  option = option.items;
                  option.title = title;
                }
                else {
                  option = [option];
                }

                var selected = 'default';
                var res = option.map(function(item){
                  var sel = that.items.contains(current.domain, item.name);
                  if (sel){
                    selected = item.name;
                  }
                  return {
                    text: item.text,
                    name: item.name,
                    selected: sel
                  }
                });
                res.domain = current.domain;
                res.selected = selected;
                res.title = option.title;
                return res;
              }));
            }, []);

            $scope.ok = function () {
              $scope.items.forEach(function(item){
                if (item.length === 1){
                  that.items.place(item.domain, item[0].name, item[0].selected);
                }
                else {
                  item.forEach(function(subItem){
                    that.items.place(item.domain, subItem.name, false);
                  });

                  if(item.selected){
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

      function getResponse(def){
        if ( typeof def === 'string'){
          def = def.split(':');
          var request = new XMLHttpRequest();

          request.open('GET', '/js/selfserve/engage/dev/local-app/mock/data' + def[1], false);
          request.send(null);

          return [def[0], request.response]  ;
        }
        else if(def instanceof Array ){
          return def;
        }
        else {
          def();
        }
      }

      return {
        isActive: function(domain, name){
          return that.items.contains(domain, name);
        },
        generateResponse: function(def, domain, options){
          options = options || [];
          return options.filter(function(item){
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