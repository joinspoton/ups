Universal parcel service for asset building. https://npmjs.org/package/ups

---

Goals:

* Infinite flexibility.
* Maximum caching.
* Zero downtime.
* Instant serving.
* Painless development.

Enter UPS. It has no implementation requirements, prefers being cached forever, can be switched in place, is completely static, and supports agile development.

> Write a config. Call `ups.build()`. Load the resulting manifest. Serve chilled.

UPS processes each asset based on its type, eventually ending up with concatenated groups of CSS and JS. Then it saves each group in a file named with the checksum. Lastly, it stores the final list in a manifest, which can be loaded and inserted into HTML.

At SpotOn, we have a production deployer running UPS. After pulling an app, it builds the assets, then restarts the instances, and finally cleans up. This lets us enable full caching, since updated assets use new file names. And since the assets are built independently of the instances, the app can simultaneously run old and new assets without issues. During local development, we just run UPS when the app starts up. Ultimately, the resulting manifest is loaded into a global variable and used in our templates.

---

    config
    {
        "_src": ""
      , "_out": ""
      , "_web": ""
      , "group1": []
      , "group2": []
      , "groupx": []
    }

* A JSON file somewhere convenient. We suggest `/assets.json`.
* `_src` is the file base path relative to the config. We suggest `""`.
* `_out` is the file output path relative to the config. We suggest `"public/ups"`.
* `_web` is the web base path. We suggest `"/ups"`.
* Everything else should be groups of files relative to the config.

`ups.types`  
Object of supported file types and their handlers. `css` and `js` are enabled by default. `styl` can be loaded via `require('ups/types/...')`. Supports custom types; each should have a `type`, `render(file, data, next)`, and `minify(file, data, next)`.

`ups.build(config, minify, next)`  
Builds assets, optionally `minify`ing them in the process. Writes the resulting files and `manifest.json` to `_out`.

`ups.clean(config, next)`  
Removes extraneous files in `_out`.

    manifest
    {
        "all": {}
      , "css": {}
      , "js": {}
    }

* A JSON file saved to `_out/manifest.json` during building.
* `all` is an object of all the files. The keys are the group name and file type, and the values are the checksum.
* `css` is an object of all the CSS groups. The keys are the group name, and the values are the HTML.
* `js` is an object of all the JS groups. The keys are the group name, and the values are the HTML.

---

© 2013 [SpotOn](https://spoton.it), shared under the [MIT License](http://www.opensource.org/licenses/MIT).