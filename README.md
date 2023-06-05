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
