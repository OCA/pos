# `browser_ipp`

this is just a small library to be able to print through ipp from the browser.

## usage

to use it, the file `dist/browser_ipp.js` must be loaded.
it defines this global function:

```javascript
ippPrint(printerURL, documentFormat, dataString)
```

## packaging the library

this library depends on the `ipp` npm module.
it needs to be packaged with `browserify` to be used in the browser, like so:

```sh
npm install -g browserify
browserify main.js -o dist/browser_ipp.js
```
