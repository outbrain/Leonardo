angular.module('leonardo').run(['$rootScope', 'leoConfiguration', function($rootScope, leoConfiguration) {
  var getUrl = function(photo){
    return 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_b.jpg'.replace('{farm-id}', photo.farm).replace('{server-id}', photo.server).replace('{id}', photo.id).replace('{secret}', photo.secret);
  };

  var configMission = function(){
    var mission = leoConfiguration.getState('Set Mission');
    $rootScope.mission = mission ? mission.data : "";
  };

  leoConfiguration.addState({
    name: 'Set Mission',
    options: [
      { name: 'turtles', data: "Protect April o'neil" },
      { name: 'shredder', data: 'Destroy the ninja turtles' }
    ]
  });

  leoConfiguration.addStates([
    {
      name: 'flicker-images',
      verb: "jsonp",
      url: 'http://api.flickr.com/services/feeds/photos_public.gne',
      options: [
        {
          name: 'get ninja turtles', status: 200,
          data: {
            "items": [
              {
                "id": "20054214406",
                "secret": "5a0800532b",
                "server": "328",
                "farm": 1,
                "title": "leo1",
                "isprimary": "1",
                "ispublic": 1,
                "isfriend": 0,
                "isfamily": 0
              },
              {
                "id": "19896041068",
                "secret": "3b3c6a45e9",
                "server": "402",
                "farm": 1,
                "title": "017580",
                "isprimary": "0",
                "ispublic": 1,
                "isfriend": 0,
                "isfamily": 0
              },
              {
                "id": "20084284365",
                "secret": "6d6b780089",
                "server": "3782",
                "farm": 4,
                "title": "4034607-turtle2119",
                "isprimary": "0",
                "ispublic": 1,
                "isfriend": 0,
                "isfamily": 0
              },
              {
                "id": "19896162428",
                "secret": "4d70df22b9",
                "server": "3718",
                "farm": 4,
                "title": "1990, TEENAGE MUTANT NINJA TURTLES",
                "isprimary": "0",
                "ispublic": 1,
                "isfriend": 0,
                "isfamily": 0
              }
            ].map(function(photo) {
              return {
                media: {
                  m: getUrl(photo)
                }
              };
            })
          }
        },
        {
          name: 'get ninja enemies', status: 200,
          data: {
            "items": [
              {
                "id": "20058148116",
                "secret": "5be49c9aa2",
                "server": "312",
                "farm": 1,
                "title": "the_shredder_2014_by_araghenxd-d7r04sc",
                "isprimary": "1",
                "ispublic": 1,
                "isfriend": 0,
                "isfamily": 0
              },
              {
                "id": "20102720711",
                "secret": "0494812a0b",
                "server": "408",
                "farm": 1,
                "title": "bebop-rocksteady",
                "isprimary": "0",
                "ispublic": 1,
                "isfriend": 0,
                "isfamily": 0
              },
              {
                "id": "19909252418",
                "secret": "eff51f40ba",
                "server": "502",
                "farm": 1,
                "title": "tartarugasninja2_3",
                "isprimary": "0",
                "ispublic": 1,
                "isfriend": 0,
                "isfamily": 0
              }
            ].map(function(photo) {
                return {
                  media: {
                    m: getUrl(photo)
                  }
                };
              })
          }
        }

      ]
    }
  ]);

  leoConfiguration.addScenario({
      name: 'I am a ninja',
      states: [
        { name: 'flicker-images', option: 'get ninja turtles' },
        { name: 'Set Mission', option: 'turtles' }
      ]
  });

  leoConfiguration.addScenario({
      name: 'I am shredder',
      states: [
        { name: 'flicker-images', option: 'get ninja enemies' },
        { name: 'Set Mission', option: 'shredder' }
      ]
  });

  $rootScope.$on('leonardo:setStates', configMission);
  configMission();
}]);
