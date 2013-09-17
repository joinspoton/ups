Universal parcel service for asset building. https://npmjs.org/package/ups

---

Goals:

* Infinite flexibility.
* Maximum caching.
* Zero downtime.
* Instant serving.
* Painless development.

Enter Parcel. It has no implementation requirements, prefers being cached forever, can be switched in place, is completely static, and supports agile development.

Put a config somewhere (we suggest `/assets.json`):

  {
      "_src": ""
    , "_out": ""
    , "_web": ""
    , "group1": [...]
    , "group2": [...]
    , "groupx": [...]
  }

* `_src` is the file base path relative to the config.
* `_out` is the file output path relative to the config.
* `_web` is the web base path.
* Everything else should be groups of files relative to the config.

Call `parcel.build()`. Load the resulting manifest. Serve chilled.

---

© 2013 [SpotOn](https://spoton.it), shared under the [MIT License](http://www.opensource.org/licenses/MIT).