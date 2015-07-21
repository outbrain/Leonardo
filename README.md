![Leonardo logo](extension/images/leonardo.png)  Leonardo Docs 
=============

Mocking made simple and consistent.
Developed by Outbrain.

## Requirements 

#### Load Dependency scripts

AngularJS (tested with v1.3)

#### Load Leonardo scripts

```html
<!DOCTYPE HTML>
<html>
<body ng-app="app">
  //.....
  <script src="src/js/leonardos.js"></script>
</body>
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
<body ng-app="app" activator>
  //.....
</body>
</html>
```

A plunker demonstration http://plnkr.co/edit/w8oaELXwQldv6AeZjnhD?p=preview

## Screen 
![example image](extension/images/example.png)

## Documentation
http://outbrain.github.io/Leonardo


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

