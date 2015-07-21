![Leonardo logo](extension/images/leonardo.png)  Leonardo Docs 
=============

Mocking and testing made simple and consistent.
Developed by Outbrain.

## Requirements 

#### Load Dependency scripts

Angular (tested with v1.3)
Angular Mocks module  (tested with v1.3)

#### Load Leonardo script

```html
<!DOCTYPE HTML>
<html>
<body ng-app="app">
  //.....
  <script src="[bower_componenets|node_modules|other]/angular/angular.js"></script>
  <script src="[bower_componenets|node_modules|other]/angular-mocks/angular-mocks.js"></script>
  //.....
  <script src="[bower_componenets|node_modules|other]/leonardos/leonardos.js"></script>
</body>
</html>
```

#### Load Leonardo css

```html
<!DOCTYPE HTML>
<html>
<head>
  //.....
  <link rel="stylesheet" media="all" href="[bower_componenets|node_modules|other]/leonardos/leonardo.min.css" />
</head>
</html>
```

#### Add Angular module dependancy

```html
<!DOCTYPE HTML>
<html>
<body ng-app="app">
  //.....
   <script>
    var myApp = angular.module("app", ["leonardo"]);
   </script>
</body>
</html>
```
#### Add Attribute For UI Activation Via Icon

```html
<!DOCTYPE HTML>
<html>
<body ng-app="app" leo-activator>
  //.....
</body>
</html>
```

A plunker demonstration http://plnkr.co/edit/w8oaELXwQldv6AeZjnhD?p=preview

## Screen 
![example image](extension/images/example.png)

## Documentation
http://outbrain.github.io/Leonardo/docs/configuration.srv.html


## Running and contributing

#### Compile

`cd` into the project folder

```bash
npm run compile
```

This compiles the code as well as documentation.

#### Auto Recompile

To automatically recompile the files on each change run

```bash
npm run compile:watch
```

Note that this does not recompile the documentation.

Note that this does not auto-refreshes the browser.

#### Compile Documentation

Running `npm run compile` compiles the documentation. But if you need to recompile it later also,
(for example when running with `gulp watch`) run

```bash
npm run compile:docs
```

#### Running

Run local server and navigate to `index.html`.

