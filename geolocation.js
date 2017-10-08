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
    },

    // Functions...
    getDistance: function (lat1, lon1, lat2, lon2) {
      var p = 0.017453292519943295; // Math.PI / 180
      var c = Math.cos;
      var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

      return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    },

    getBearing: function (lat1, lon1, lat2, lon2) {
      function radians(n) {
        return n * (Math.PI / 180);
      }

      function degrees(n) {
        return n * (180 / Math.PI);
      }

      lat1 = radians(lat1);
      lon1 = radians(lon1);
      lat2 = radians(lat2);
      lon2 = radians(lon2);

      var dLong = lon2 - lon1;

      var dPhi = Math.log(Math.tan(lat2 / 2.0 + Math.PI / 4.0) / Math.tan(lat1 / 2.0 + Math.PI /
        4.0));
      if (Math.abs(dLong) > Math.PI) {
        if (dLong > 0.0)
          dLong = -(2.0 * Math.PI - dLong);
        else
          dLong = (2.0 * Math.PI + dLong);
      }

      return (degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
    }
  };
};