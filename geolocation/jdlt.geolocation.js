Geolocation = function () {
    var _this = this;

    _this.handlers = {};
    _this.lastPosition = null;
    _this.watcher = null;
    tracking = false;

    fire = function (key, o) {
        if (_this.handlers[key])
            _this.handlers[key].forEach(function (fn) {
                fn(o);
            });
    }

    firePosition = function (position) {
        if (!position) return;

        // prepare
        var p = {
            accuracy: position.coords.accuracy,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
        };

        // fire
        fire('state', {
            name: 'New position',
            position: p
        });
        fire('position', p);

        return position;
    }

    _this.positionWatcher = function (position) {
        _this.lastPosition = firePosition(position);
        if (tracking) {
            if (!_this.watcher) {
                _this.watcher = navigator.geolocation.watchPosition(_this.positionWatcher, error, {});
                fire('state', {
                    name: 'Tracking'
                });
            }
        } else {
            fire('state', {
                name: 'Stopped'
            });
        }
    };

    function error(error) {
        var message;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = ("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                message = ("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                message = ("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                message = ("An unknown error occurred.");
                break;
        }
        fire('state', {
            name: 'Error',
            message: message
        });
    };

    return {
        on: function (key, fn) {
            if (!_this.handlers[key])
                _this.handlers[key] = new Array;

            _this.handlers[key].push(fn);
            return this;
        },

        start: function () {
            try {
                if (tracking) firePosition(_this.lastPosition)
                else {
                    navigator.geolocation.getCurrentPosition(_this.positionWatcher, error, {});
                    tracking = true;
                    fire('state', {
                        name: 'Locating'
                    });
                }
            } catch (message) {
                console.log('error', message);
                fire('error', message);
                fire('state', {
                    error: message
                });
            }
            return this;
        },

        stop: function () {
            if (_this.watcher) {
                navigator.geolocation.clearWatch(_this.watcher);
                _this.watcher = null;
                fire('state', {
                    name: 'Stopped'
                });
            }
            tracking = false;
            return this;
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
        },

        getDistance: function (lat1, lon1, lat2, lon2) {
            var p = 0.017453292519943295; // Math.PI / 180
            var c = Math.cos;
            var a = 0.5 - c((lat2 - lat1) * p) / 2 +
                c(lat1 * p) * c(lat2 * p) *
                (1 - c((lon2 - lon1) * p)) / 2;

            return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        }
    }
}
var geolocation = new Geolocation();