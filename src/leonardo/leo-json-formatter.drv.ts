export function jsonFormatter() {
  return {
    restrict: 'E',
    scope: {
      jsonString: '=',
      onError: '&',
      onSuccess: '&'
    },
    controller: JsonFormatterCtrl,
    bindToController: true,
    controllerAs: 'leoJsonFormatterCtrl',
    template: '<textarea ng-model="leoJsonFormatterCtrl.jsonString" ng-change="leoJsonFormatterCtrl.valueChanged()" />'
  }
};


class JsonFormatterCtrl {
  private jsonString;
  private onSuccess: Function;
  private onError: Function;

  constructor($scope) {
    $scope.$watch('jsonString', function () {
      this.valueChanged();
    }.bind(this));
  }

  valueChanged() {
    try {
      JSON.parse(this.jsonString);
      this.onSuccess({value: this.jsonString});
    }
    catch (e) {
      this.onError({msg: e.message});
    }
  };

}