var Geolocation = function () {
  var handlers = [];
  var watcher = false;
  var options = {};

  var fire = function (o, thisObj) {
    var scope = thisObj || window;
    handlers.forEach(function (fn) {
      fn.call(scope, o);
    });
  }

  function newPosition(position) {
    fire(position.coords);

    if (!watcher) {
      navigator.geolocation.watchPosition(newPosition, error, options);
      watcher = true;
    }
  };

  function error(e) {
    console.log(e);
  };

  return {
    // Subscribers...
    subscribe: function (fn) {
      handlers.push(fn);
    },
    unsubscribe: function (fn) {
      handlers = handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    },
    // Operations... 
    start: function () {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(newPosition, error, options);
      } else {
        console.log('Geolocation not supported.');
      }
    },
    stop: function () {
      watcher = false;
    }
  };
};