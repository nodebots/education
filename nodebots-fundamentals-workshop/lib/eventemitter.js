(function( exports ) {

  function EventEmitter() {}

  EventEmitter.prototype.emit = function() {
    var type, handlers, args, listeners;

    type = arguments[0];
    args = [].slice.call( arguments, 1 );

    if ( !this._events ) {
      this._events = {};
      return this;
    }

    handlers = this._events[ type ];

    if ( handlers && handlers.length ) {
      listeners = handlers.slice();

      while ( listeners.length ) {
        listeners.shift().apply( this, args );
      }
    }

    return this;
  };

  EventEmitter.prototype.on = function( type, listener ) {
    if ( !this._events ) {
      this._events = {};
    }

    if ( !this._events[ type ] ) {
      this._events[ type ] = [];
    }

    this._events[ type ].push( listener );

    return this;
  };

  EventEmitter.prototype.once = function( type, listener ) {
    return this.on( type, function once() {
      this.off( type, once );
      listener.apply( this, [].slice.call(arguments) );
    });
  };

  EventEmitter.prototype.off = function( type, listener ) {
    if ( !this._events || !this._events[ type ] ) {
      return this;
    }

    var list = this._events[ type ];

    if ( listener ) {
      this._events[ type ].splice(
        list.indexOf( listener ), 1
      );
    }
    else {
      delete this._events[ type ];
    }

    return this;
  };

  exports.EventEmitter = EventEmitter;


  if ( typeof define === "function" &&
      define.amd && define.amd.EventEmitter ) {
    define( "eventemitter", [], function () { return EventEmitter; } );
  }


}(this));
