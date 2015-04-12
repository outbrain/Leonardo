Leonardo Docs 
=============

## Compile

`cd` into the project folder

```bash
npm run compile
```

This compiles the code as well as documentation.

## Auto Recompile

To automatically recompile the files on each change run

```bash
npm run compile:watch
```

Note that this does not recompile the documentation.

Note that this does not auto-refreshes the browser.

## Compile Documentation

Running `npm run compile` compiles the documentation. But if you need to recompile it later also,
(for example when running with `gulp watch`) run

```bash
npm run compile:docs
```

## Running

Run local server and navigate to `index.html`.

## Documentation and example

http://outbrain.github.io/Leonardo
