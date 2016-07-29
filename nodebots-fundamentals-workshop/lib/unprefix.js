/*! Unprefix.js - v0.2.0 - 5/29/2012
* https://github.com/rwldrn/unprefix.js
* Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>; Licensed MIT */

(function( window ) {

  var Unprefix, unprefix,
      raw = [

        // This may appear redundant, possibly even unnecessary,
        // but it's much easier to keep track of all prefixes
        // that are being tested, when they are presented in a
        // readable and maintainable format.

        // CSS
        " -moz- -ms- -o- -webkit- ",

        // DOM
        "moz ms o O webkit Webkit",

        // API
        "Moz MS O WebKit"
      ],
      prefixes = {
        all: [],
        cached: {
          // api: found
        }
      },
      supported = {
        // api: bool
      };

  // Do the dirty join/split here instead of in the variable
  // declaration list. This keeps the initialized var list
  // a little less crowded.
  raw.join(" ").split(" ").forEach(function( value ) {
    // Skip prefixes that are already accounted for
    if ( !~prefixes.all.indexOf(value) ) {
      prefixes.all.push( value );
    }
  });

  prefixes.all.sort();

  Unprefix = function() {
    var k = -1;

    this.length = prefixes.all.length;

    while ( k < prefixes.all.length ) {
      this[ ++k ] = prefixes.all[ k ];
    }
  };

  // Borrow methods from Array.prototype
  [ "pop", "shift", "unshift", "slice", "push", "join" ].forEach(function( method ) {
    Unprefix.prototype[ method ] = Array.prototype[ method ];
  });

  // Grant read access to cached apis
  Unprefix.prototype.cached = function( key ) {
    return prefixes.cached[ key ] || prefixes.cached;
  };

  // Returns a prefixed expanded string of properties
  Unprefix.prototype.expand = function( prop ) {
    return this.join( prop + " " ) + prop;
    // eg. prop = "foo"
    // "foo Foo -moz-Foo -ms-Foo -o-Foo -webkit-Foo MSFoo \
    // MozFoo OFoo WebKitFoo WebkitFoo mozFoo msFoo oFoo webkitFoo"
  };

  // Define the main translation function
  Unprefix.prototype.translate = function( object, api ) {
    var tests, test,
        alt = api,
        k = 0;

    // If we've already looked this up and stored it,
    // return from the cache to avoid unnec redundant processing
    // May be unnec.?
    if ( prefixes.cached[ api ] ) {
      return object[ prefixes.cached[ api ] ];
    }

    // Assume no support, wait to be proven wrong
    supported[ api ] = false;

    // If we received a lowercased api/prop, create an
    // alternate uppercase api to lookup
    if ( api[0] === api[0].toLowerCase() ) {
      alt = api[0].toUpperCase() + api.slice(1);
    }

    tests = ( api + " " + this.expand(alt) ).split(" ");

    while ( k < tests.length ) {
      test = tests[ k ];

      if ( test && test in object ) {
        //  Cache the found API
        prefixes.cached[ api ] = test;
        supported[ api ] = true;

        return object[ test ];
      }
      k++;
    }
  };

  var instance = new Unprefix();

  // Expose the Unprefixed instance
  window.unprefix = function( object, api ) {
    if ( !arguments.length ) {
      return instance;
    }

    return instance.translate( object, api );
  };

  // If this is an actual window with a document,
  // Initialize awesome new APIs
  if ( window.document ) {
    // Like the redundant lines above, this might *look* like
    // "wet" code, but I think it's a good way to very clearly
    // indicate which APIs we're going to auto-unprefix. It's
    // also very grep/control-f friendly.
    [
      // window apis
      { lookin: window,
        find: [
          "URL",
          "Blob",
          "BlobBuilder",
          "performance"
        ]
      },

      // depends on window apis
      // performance
      { lookin: (performance = window.performance || {}),
        find: [
          "now"
        ]
      },

      // navigator apis
      { lookin: navigator,
        find: [
          "battery",
          "getUserMedia",
          "geolocation",
          "pointer",
          "onLine"
        ]
      },

      // document apis
      { lookin: document,
        find: [
          "cancelFullscreen",
          "currentFullscreenElement",
          "fullscreen",
          "hidden",
          "visibilityState"
        ]
      },

      // element apis
      { lookin: Element.prototype,
        find: [
          "cancelFullscreen",
          "cancelFullScreen",
          "currentFullscreenElement",
          "exitFullscreen",
          "exitFullScreen",
          "requestFullScreen"
        ]
      },

      // element apis
      { lookin: Node.prototype,
        find: [
          "cancelFullscreen",
          "cancelFullScreen",
          "currentFullscreenElement",
          "exitFullscreen",
          "exitFullScreen",
          "requestFullScreen"
        ]
      }


      // boilerplate
      // { lookin: {}, find: "foo" }

    ].forEach(function( api ) {
      // Assign the webapi spec name to the correct api object
      // eg. window.URL = { window.webkitURL }
      api.find.forEach(function( webapi ) {
        api.lookin[ webapi ] = instance.translate( api.lookin, webapi );
      });
    });

    window.unprefix.cached = function( key ) {
      return prefixes.cached[ key ] || prefixes.cached;
    };

    window.unprefix.supported = supported;
  }

}( this ));
