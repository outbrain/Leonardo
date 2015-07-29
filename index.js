"use strict";
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Flicker = angular.module('flicker-example', ['leonardo','akoenig.deckgrid'])
  .config(function ($locationProvider) {
    $locationProvider.html5Mode(false);
  })
  .controller('flickerCtrl', function ($scope, flickerGetter) {
    $scope.loadClicked = function () {
      $scope.loading = true;
      flickerGetter.getData().then(function(data){
        $scope.photos = data;
        console.log(data);
        $scope.loading = false;
      }, function () {
        $scope.loading = false;
      });

      tour.next();
    };


    var tour = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-theme-arrows'
      }
    });

    tour.addStep('load', {
      text: "Click here to load data with this<br/> example's http request to flicker.",
      attachTo: '.load bottom',
      buttons: []
    });

    tour.addStep('leonardo', {
      text: 'Use leonardo to start mocking http or anything you like!',
      attachTo: '.leonardo-activator',
      advanceOn: '.leonardo-activator click',
      buttons: []
    });

    tour.addStep('load-again', {
      text: 'now load again!',
      attachTo: '.load left',
      buttons: []
    });

    setTimeout(function(){
      tour.start();
    }, 800);

  });

Flicker.factory('flickerGetter', ['$q', '$http', function ($q, $http) {
  var tags = ['cartoons', 'smurfs', 'nature', 'space'];

  return {
    getData: function(){
      var defer = $q.defer();

      $http.jsonp(' http://api.flickr.com/services/feeds/photos_public.gne', {
        method: 'jsonp',
        params: {
          tags: tags[getRandomIntInclusive(0, tags.length - 1)],
          tagmode: "any",
          format: 'json',
          jsoncallback: 'JSON_CALLBACK'
        }
      }).success(function (data) {
        data = data.items.map(function (item) {
          var imageUrl = item.media.m;
          return {
            imageUrl: imageUrl
          };
        });
        defer.resolve(data);
      }).error(function () {
        defer.resolve();
      });

      return defer.promise;
    },
    getNinjaData: function () {
      var defer = $q.defer();

      $http.jsonp('https://api.flickr.com/services/rest', {
        method: 'jsonp',
        params: {
          method: "flickr.photosets.getPhotos",
          api_key: "70da7d9dfe17a2df01c7dfe04004af17",
          "photoset_id": "72157654126439284", //72157656472911925
          "user_id": "134998090@N03",
          "format": "json",
          jsoncallback: 'JSON_CALLBACK'
        }
      }).success(function (data) {
        defer.resolve(data.photoset.photo.map(function (photo) {
          return {
            imageUrl: 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_b.jpg'.replace('{farm-id}', photo.farm).replace('{server-id}', photo.server).replace('{id}', photo.id).replace('{secret}', photo.secret)
          };
        }));
      }).error(function () {
        defer.resolve();
      });

      return defer.promise;
    }
  };
}]);


