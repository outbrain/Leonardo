## Leonardo
[![Build Status](https://travis-ci.org/outbrain/Leonardo.svg?branch=master)](https://travis-ci.org/outbrain/Leonardo)
[![npm version](https://badge.fury.io/js/leonardojs.svg)](http://badge.fury.io/js/leonardojs)
[![Bower version](https://badge.fury.io/bo/leonardo.svg)](http://badge.fury.io/bo/leonardo)

[![Package Quality](http://npm.packagequality.com/badge/leonardojs.png)](http://packagequality.com/#?package=leonardojs)

![Mocking and testing made simple and consistent. Developed by Outbrain.](https://raw.githubusercontent.com/outbrain/Leonardo/master/leonardo.png)

## Example

* [Full Application Example](http://outbrain.github.io/Leonardo/examples/angularIL/)

# Getting Started

### 1. Install

__npm__
```sh
$ npm install leonardojs
```

__bower__
```sh
$ bower install leonardo
```

### 2. Add Leonardo script

```html
<!DOCTYPE HTML>
<html>
<body>
  //.....
  <script src="[bower_componenets|node_modules|other]/leonardo/dist/leonardo.js"></script>
</body>
</html>
```

** If your app is running angularjs 1.x you will also need to add the Leonardo module as a dependency

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

### 3. Run your app
You should now see Leonardo's icon on the bottom left corner. 
Start mocking your ajax calls by using the UI or the API

## API
#### Add States
```javascript
 //.....
    Leonardo.addStates([
        {
          name: 'Get Data',
          url: '/api/user/43435',
          verb: 'GET',
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
```

#### Activate State Option
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

#### Deactivate State
Deactivates a specific state, when calling the state url request will pass through to the server
```javascript
//.....
    Leonardo.deactivateState('Update Data');
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
