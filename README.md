## Leonardo
[![Build Status](https://travis-ci.org/outbrain/Leonardo.svg?branch=master)](https://travis-ci.org/outbrain/Leonardo)
[![npm version](https://badge.fury.io/js/leonardojs.svg)](http://badge.fury.io/js/leonardojs)
[![Bower version](https://badge.fury.io/bo/leonardo.svg)](http://badge.fury.io/bo/leonardo)

[![Package Quality](http://npm.packagequality.com/badge/leonardojs.png)](http://packagequality.com/#?package=leonardojs)

![Mocking and testing made simple and consistent. Developed by Outbrain.](https://raw.githubusercontent.com/outbrain/Leonardo/master/leonardo.png)

## Example

* [Full Application Example](http://outbrain.github.io/Leonardo/examples/angularIL/)

## Install

__Dependencies__

* __[Angular](https://github.com/angular/bower-angular)__

Installing via `npm` or `bower` will bring in the above dependencies as well.

__npm__
```sh
$ npm install leonardojs
```

__bower__
```sh
$ bower install leonardo
```

#### Load Dependency scripts

Angular (tested with v1.3)

#### Add Leonardo script

```html
<!DOCTYPE HTML>
<html>
<body ng-app="app">
  //.....
  <script src="[bower_componenets|node_modules|other]/angular/angular.js"></script>
  //.....
  <script src="[bower_componenets|node_modules|other]/leonardo/dist/leonardo.js"></script>
</body>
</html>
```

#### Add Angular module dependency

```html
<!DOCTYPE HTML>
<html>
<body ng-app="app">
  //.....
   <script>
    var myApp = angular.module("app", ["leonardo"]);
    //.....    
   </script>
</body>
</html>
```

## API
#### Add States
```javascript
 //.....
    myApp.run(["leoConfiguration", function(leoConfiguration){
      leoConfiguration.addStates([
        {
          name: 'Get Data',
          url: '/api/user/43435',
          options: [
            {name: 'success', status: 200, data: { name: "Master Splinter" }},
            {name: 'error 500', status: 500},
            {name: 'error 401', status: 401}
          ]
        },
        {
          name: 'Update Data',
          url: '/api/user/43435',
          verb: 'PUT',
          options: [
            {name: 'success', status: 200},
            {name: 'error 500', status: 500},
            {name: 'error 400', status: 400}
          ]
        }
      ]);
    }]);
```

#### Activate State Option
Activates state option, mocked response will be returned when calling the state url
```javascript
//.....
    leoConfiguration.activateStateOption('Update Data', 'success');
    $http.put('/api/user/43435', { name: "Master Splinter" }).success(function(data, status) {
        console.log(status); // 200 
    });
    
    leoConfiguration.activateStateOption('Update Data', 'error 500');
    $http.put('/api/user/43435', { name: "Master Splinter" }).error(function(data, status) {
        console.log(status); // 500 
    });
//.....
```

#### Deactivate State
Deactivates a specific state, when calling the state url request will pass through to the server
```javascript
//.....
    leoConfiguration.deactivateState('Update Data');
//.....
```

## Hide/Show Leonardo icon
You can hide Leonardo activator icon by clicking `ctrl` + `shift` + `l`.


## Running and contributing


#### Install dev dependencies

`cd` into the project folder

```bash
npm install
```

#### Build

```bash
gulp build
```

#### Run (and watch)

```bash
gulp serve
```

This will run the demo app (and auto-refresh the browser)

## License
Copyright &copy; 2015 MIT License
