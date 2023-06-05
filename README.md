# CSP

Här finns blandade åtgärder för att få CSP att fungera med standardmoduler i Sitevision.

## Generellt

`script-src` behöver ha `unsafe-eval` på grund av denna rad:

```js
render = new Function(settings.variable || "obj", "_", source);
/*
at new Function (<anonymous>)
at m.template (underscore.js:1597:16)
at Module.<anonymous> (contactSearch.js:24:18)
at s (portlets-social.js:1:395)
*/
```

`style-src` behöver ha `unsafe-inline` eftersom inline styling är vanligt förekommande (inte bara i Velocitymallar). Se exempel:

**webpack:///src/social/util/MessageClient/messageClient.js** (via portlets-social.js)

```js
var scrollDiv = $(
  '<div style="width:100px;height:100px;overflow:scroll;position:absolute;top:-9999em;" />'
)[0];
```

**webpack:///src/vendor/emoji/emoji.js** (via portlets-social.js)

```js
var css = ".emoji-picker {\n  margin: 0 0.5em;\n ...n}";
styleInject(css);
```
