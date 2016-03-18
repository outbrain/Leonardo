angular.module('leonardo').provider('$leonardo', function LeonardoProvider() {
    var pref = '';

    this.setAppPrefix = function (prefix) {
        pref = prefix;
    };

    this.$get = [function leonardoProvider() {

        return {
            getAppPrefix: function () {
                return pref;
            }
        };
    }];
});