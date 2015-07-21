angular.module('leonardo').run(['leoConfiguration', function(leoConfiguration) {
  leoConfiguration.addStates([
    {
      name: 'flicker-images',
      verb: "jsonp",
      url: 'http://api.flickr.com/services/feeds/photos_public.gne',
      options: [
        {
          name: 'get ninja turtles', status: 200,
          data: {
            "title": "Uploads from everyone",
            "link": "http://www.flickr.com/photos/",
            "description": "",
            "modified": "2015-07-20T12:15:11Z",
            "generator": "http://www.flickr.com/",
            "items": [
              {
                "title": " ",
                "link": "http://www.flickr.com/photos/96262590@N07/19233636364/",
                "media": {"m":"http://farm1.staticflickr.com/504/19233636364_4c716652b0_m.jpg"},
                "date_taken": "2015-07-20T08:21:12-08:00",
                "description": " <p><a href=\"http://www.flickr.com/people/96262590@N07/\">tranvhoa96<\/a> posted a photo:<\/p> <p><a href=\"http://www.flickr.com/photos/96262590@N07/19233636364/\" title=\" \"><img src=\"http://farm1.staticflickr.com/504/19233636364_4c716652b0_m.jpg\" width=\"240\" height=\"240\" alt=\" \" /><\/a><\/p> ",
                "published": "2015-07-20T12:15:11Z",
                "author": "nobody@flickr.com (tranvhoa96)",
                "author_id": "96262590@N07",
                "tags": ""
              },
              {
                "title": "Expo",
                "link": "http://www.flickr.com/photos/123560819@N08/19233637204/",
                "media": {"m":"http://farm4.staticflickr.com/3801/19233637204_0a6ae5fd23_m.jpg"},
                "date_taken": "2015-07-11T13:43:10-08:00",
                "description": " <p><a href=\"http://www.flickr.com/people/123560819@N08/\">Italian Reporter<\/a> posted a photo:<\/p> <p><a href=\"http://www.flickr.com/photos/123560819@N08/19233637204/\" title=\"Expo\"><img src=\"http://farm4.staticflickr.com/3801/19233637204_0a6ae5fd23_m.jpg\" width=\"180\" height=\"240\" alt=\"Expo\" /><\/a><\/p> ",
                "published": "2015-07-20T12:15:13Z",
                "author": "nobody@flickr.com (Italian Reporter)",
                "author_id": "123560819@N08",
                "tags": ""
              },
              {
                "title": " ",
                "link": "http://www.flickr.com/photos/133936086@N02/19235375243/",
                "media": {"m":"http://farm1.staticflickr.com/469/19235375243_9343ef91c7_m.jpg"},
                "date_taken": "2015-07-19T17:03:05-08:00",
                "description": " <p><a href=\"http://www.flickr.com/people/133936086@N02/\">James.GC<\/a> posted a photo:<\/p> <p><a href=\"http://www.flickr.com/photos/133936086@N02/19235375243/\" title=\" \"><img src=\"http://farm1.staticflickr.com/469/19235375243_9343ef91c7_m.jpg\" width=\"240\" height=\"160\" alt=\" \" /><\/a><\/p> ",
                "published": "2015-07-20T12:15:09Z",
                "author": "nobody@flickr.com (James.GC)",
                "author_id": "133936086@N02",
                "tags": ""
              }
            ]
          }
        }
      ]
    }
  ]);
}]);