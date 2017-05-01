## Leonardo
[![Build Status](https://travis-ci.org/outbrain/Leonardo.svg?branch=master)](https://travis-ci.org/outbrain/Leonardo)
[![npm version](https://badge.fury.io/js/leonardojs.svg)](http://badge.fury.io/js/leonardojs)
[![Bower version](https://badge.fury.io/bo/leonardo.svg)](http://badge.fury.io/bo/leonardo)
[![Package Quality](http://npm.packagequality.com/shield/leonardojs.svg)](http://packagequality.com/#?package=leonardojs)

![Mocking and testing made simple and consistent. Developed by Outbrain.](https://raw.githubusercontent.com/outbrain/Leonardo/master/leonardo.png)

## Example

[Full Application Example](http://outbrain.github.io/Leonardo/examples/angularIL/)


## Video (currently only in hebrew)
[![AngularJS Israel](http://img.youtube.com/vi/zPBmMiJZ5O8/hqdefault.jpg)](http://www.youtube.com/watch?v=zPBmMiJZ5O8)
 
# Getting Started

## 1. Install

### npm

```bassh
$ npm install leonardojs --save
```

### bower

```bash
$ bower install leonardo
```

## 2. Add Leonardo script

### * Webpack 2.x

```javascript
    // in dev environment
    import "leonardojs";
```

### * directly in html
```html
 <!DOCTYPE HTML>
 <html>
 <body>
   //.....
   <script src="[bower_components|node_modules|other]/leonardo/dist/leonardo.js"></script>
 </body>
 </html>
```

## 3. Run your app
You should now see Leonardo's icon on the bottom right corner. Click It.

## 4. Start mocking your http calls via the recorder tab 
![Mocking and testing made simple and consistent. Developed by Outbrain.](https://raw.githubusercontent.com/outbrain/Leonardo/master/images/recorder.png)

## 5. Turn your mocking on and off as you wish
![Mocking and testing made simple and consistent. Developed by Outbrain.](https://raw.githubusercontent.com/outbrain/Leonardo/master/images/scenario.png)

## 6. Change your responses as you wish
![Mocking and testing made simple and consistent. Developed by Outbrain.](https://raw.githubusercontent.com/outbrain/Leonardo/master/images/responses.png)

## Javascript API
Automate your mocks using Leonardo's API

**State**:
- name: (string) State name, must be unique
- url: (string) request url, treated as regex
- verb: (string) request http verb
- options (StateOption array)

**StateOption**:
- name: (string) option name
- status: (number) http status code
- data: (primitive | Object | Function) the data to be returned in response body. 
    - Use function to dynamically control the response (first parameter is the request object).


### Add States
`addState(State array)`
```javascript
 //.....
    Leonardo.addStates([
        {
          name: 'Get Data',
          url: '/api/user/43435',
          verb: 'GET',
          options: [
            {name: 'success', status: 200, data: { name: "Master Splinter" }},
            {name: 'error 500', status: 500}
          ]
        },{
          name: 'Get Data',
          url: '/api/user/43435',
          verb: 'GET',
          options: [
            {name: 'success', status: 200, data: { name: "Master Splinter" }},
            {name: 'error 500', status: 500}
          ]
        },
        {
          name: 'Get Characters',
          url: '/api/character',
          verb: 'GET',
          options: [
            {
              name: 'success', 
              status: 200,
              data: function(request) {
                if (request.url.indexOf('term=Donatello') > 0) {
                  return { name: "Donatello" };
                } else {
                  return { name: "Raphael" };                  
                }
              }
            },
          ]
        }
  ]);
```

### Activate State Option
`activateStateOption(stateName, optionName)`

Activates state option, mocked response will be returned when calling the state url

```javascript
//.....
    Leonardo.activateStateOption('Update Data', 'success');
    $http.put('/api/user/43435', { name: "Master Splinter" }).success(function(data, status) {
        console.log(status); // 200 
    });
    
    Leonardo.activateStateOption('Update Data', 'error 500');
    $http.put('/api/user/43435', { name: "Master Splinter" }).error(function(data, status) {
        console.log(status); // 500 
    });
//.....
```

### Deactivate State
`deactivateState(stateName)`

Deactivates a specific state, when calling the state url request will pass through to the server

```javascript
//.....
    Leonardo.deactivateState('Update Data');
//.....
```

### Hide/Show Leonardo icon
You can hide Leonardo activator icon by clicking `ctrl` + `shift` + `l`.

## Running and contributing

### Go into the project folder

```bash
$ cd Leonardo
```

### Install

```bash
$ npm install
```

### Build

```bash
$ npm run build
```

### Run (and watch)

```bash
$ npm start 
```

This will run the demo app (and auto-refresh the browser)
