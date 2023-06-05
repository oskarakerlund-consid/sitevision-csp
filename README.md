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

## Sök facetterad

Som standard används här `linkRenderer.setOnclick` i velocity vilket infogar nya `<script>`-taggar med ajaxsvaret. Dessa taggar har ett nytt nonce-värde som inte matchar sidan som laddar dem, och därmed nekas scripten. Vi behöver kommentera bort `setOnclick` och lyssna på länkarna från sidan som laddar innehållet istället.

För facetterna infogas det script-taggar som lyssnar på klick och kör sedan `funktionsnamn` med `funktionsparameter`. Dessa två värden sätter vi som data-attribut på länkarna istället och lyssnar på dem utifrån. Därefter kör vi dem via `window` för att undvika `eval()`.

På varje sökresultat finns spårning av klick (clickTrackingCallback) som laddar en script-tagg som gör ett nytt ajax-anrop med jquery. Här kan vi lägga javascriptet i ett data-attribut på länken och därefter lyssna utifrån på klick. Då kan vi extrahera URL från data-attributet och göra ett eget anrop dit.

Pagineringen fungerar genom ett script som byggs i Velocity från en mall vi inte kommer åt. Vi kan dock fånga upp ett ajaxsvar med `dataFilter` innan det injiceras på sidan. Där plockar vi bort script-taggen och parsar ut JSON-objektet och kör pagineringsccriptet själva, efter att innehållet laddats in. Det finns en risk att detta slutar fungera om `dataFilter` ersätts någon annansstans.
