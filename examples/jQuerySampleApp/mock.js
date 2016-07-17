
angular.module('leonardo').run(['leoConfiguration', function (leoConfiguration) {

  leoConfiguration.addStates([
    {
      "name": "Get Json",
      "url": "/get-json",
      "verb": "GET",
      "options": [
        {
          "name": "success",
          "status": 200,
          "data": {
            message: "data!"
          },
          "delay": 0
        },
        {
          "name": "Error 500",
          "status": 200,
          "error": {
            message: "Error 500!"
          },
          "delay": 0
        }
      ]
    }
  ]);
}]);
