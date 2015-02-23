## Dgeni - Angular App Demo

This project demonstrates how you can use the angularjs dgeni package
to generate documentation for almost any AngularJS application

### Build

You'll need node.js. Then do:

```bash
npm install
gulp assets dgeni
```

This generates a bunch of HTML files in the `build` folder.
You'll need to host these in a webserver. Try `http-server`:

```bash
npm install -g http-server
http-server build/
```

(**It is important to run it from the `build` folder in order that
the links to CSS files work correctly**)

Then browser to http://localhost:8080/modules/app