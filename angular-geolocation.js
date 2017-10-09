angular.module('ngGeolocation', [])
    .factory('GeoFactory', ['$http', function ($http) {
        var handlers = [];
        var options = {};
        var position = null;
        var tracking = false;
        
        var fire = function (o, thisObj) {
            var scope = thisObj || window;
            handlers.forEach(function (fn) {
                fn.call(scope, o);
            });
        }

        function newPosition(position) {
            fire({
                accuracy: position.coords.accuracy,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: position.timestamp
            });

            if (!tracking) {
                navigator.geolocation.watchPosition(newPosition, error, options);
                tracking = true;
            }
        };

        function error(error) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
              case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
              case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
              case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                break;
            }
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
                tracking = false;
            },
            
            // Shared functions...
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
            },

            getDistance: function (lat1, lon1, lat2, lon2) {
                var p = 0.017453292519943295; // Math.PI / 180
                var c = Math.cos;
                var a = 0.5 - c((lat2 - lat1) * p) / 2 +
                    c(lat1 * p) * c(lat2 * p) *
                    (1 - c((lon2 - lon1) * p)) / 2;

                return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
            }
        };
    }])