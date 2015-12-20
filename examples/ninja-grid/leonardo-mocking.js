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
              { "id": "20054214406", "secret": "5a0800532b", "server": "328", "farm": 1, "title": "leo1", "isprimary": 1, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19896041068", "secret": "3b3c6a45e9", "server": "402", "farm": 1, "title": "017580", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "20084284365", "secret": "6d6b780089", "server": "3782", "farm": 4, "title": "4034607-turtle2119", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19896162428", "secret": "4d70df22b9", "server": "3718", "farm": 4, "title": "1990, TEENAGE MUTANT NINJA TURTLES", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19483953394", "secret": "449e8942ff", "server": "519", "farm": 1, "title": "Splinter_tf", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "20098615082", "secret": "70dbbb6232", "server": "521", "farm": 1, "title": "images", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "20112045131", "secret": "875c0d15c2", "server": "331", "farm": 1, "title": "41P8j7A-0mL", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19483942244", "secret": "8a91a5bd32", "server": "430", "farm": 1, "title": "41pKenXOyCL._SY300_", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19918490918", "secret": "562a05b2ae", "server": "445", "farm": 1, "title": "leonardo-teenage-mutant-ninja-turtles", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19483948404", "secret": "9147179e8e", "server": "315", "farm": 1, "title": "michelangelo-teenage-mutant-ninja-turtles", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19918570140", "secret": "626580ce9d", "server": "286", "farm": 1, "title": "raphael-teenage-mutant-ninja-turtles", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 }

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
              { "id": "20058148116", "secret": "5be49c9aa2", "server": "312", "farm": 1, "title": "the_shredder_2014_by_araghenxd-d7r04sc", "isprimary": 1, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "20102720711", "secret": "0494812a0b", "server": "408", "farm": 1, "title": "bebop-rocksteady", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19909252418", "secret": "eff51f40ba", "server": "502", "farm": 1, "title": "tartarugasninja2_3", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "20080303826", "secret": "d9064e9253", "server": "509", "farm": 1, "title": "Shredder87", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19918490318", "secret": "126d63dcde", "server": "526", "farm": 1, "title": "Krang1987", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "20106588825", "secret": "b30649c209", "server": "323", "farm": 1, "title": "CGI_Shredder", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19918567750", "secret": "b21855337c", "server": "296", "farm": 1, "title": "bebop_by_sharpwriter-d39pl6j", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19919891449", "secret": "8267e93e5c", "server": "308", "farm": 1, "title": "bebop_and_rocksteady_1_02_by_giosuke", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 },
              { "id": "19918487988", "secret": "45b84d5af8", "server": "3734", "farm": 4, "title": "231297-MrShadow", "isprimary": 0, "ispublic": 1, "isfriend": 0, "isfamily": 0 }

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
      name: 'None',
      states: []
  });

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
