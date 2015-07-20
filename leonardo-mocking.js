angular.module('leonardo').run(function(leoConfiguration){

  leoConfiguration.addStates([
    {
      name: 'state_animals_non_ajax',
      options: [
        {name: 'get kittens', data: ["persion", "siemi"]},
        {name: 'get dogs', data: ["labrador"]}
      ]
    },
    {
      name: 'state1',
      url: 'http://url1.com',
      options: [
        {name: 'get url1 aaaa', status: 200, data: ["url1 aaa"]},
        {name: 'get url1 bbbb', status: 200,  data: ["url1 bbb"]},
        {name: 'get url1 cccc', status: 200,  data: ["url1 ccc"]}
      ]
    },
    {
      name: "state2",
      url: 'http://url2.com',
      options: [
        {name: 'get url2 bbbb', status: 404,  data: ["url2 404 failure"]}
      ]
    },
    {
      name: "state3",
      url: 'http://url3.com',
      options: [
        {name: 'get url3 bbbb with delay', status: 200,  data: ["url3 bbb"], delay: 2000}
      ]
    },
    {
      name: "state 4 - PUT",
      url: 'http://url4.com',
      verb: 'PUT',
      options: [
        {name: 'with delay', data: ["response"], delay: 2000},
        {name: 'without delay', data: ["response"]}
      ]
    }
  ]);
});