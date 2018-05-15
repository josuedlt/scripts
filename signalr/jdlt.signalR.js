var signalR = function () {};
signalR.prototype = {

    // Get connection state name.
    stateName: function (state) {
        switch (state) {
            case ($.signalR.connectionState.connecting):
                return "connecting";
            case ($.signalR.connectionState.connected):
                return "connected";
            case ($.signalR.connectionState.disconnected):
                return "disconnected";
            case ($.signalR.connectionState.reconnecting):
                return "reconnecting";
        }
    },

    connectToHub: function (url, callback) {
        return this.connectToHubs([url], function (hubs) {
            callback(hubs[0]);
        });
    },
    connectToHubs: function (urls, callback) {
        return new Promise(function (resolve) {
            var hubs = [];

            function addHub(h, i) {
                hubs[i] = h;
                if (hubs.length == urls.length) {
                    if (callback) callback(hubs);
                    resolve(hubs);
                }
            }

            try {
                urls.forEach(function (url, i) {
                    $.ajax({
                        async: false,
                        cache: false,
                        dataType: 'script',
                        url: url + '/signalr/hubs',
                        complete: function () {
                            h = $.hubConnection(url);
                            h.createHubProxies();
                            addHub(h, i);
                        },
                    });
                });
            } catch (e) {
                addHub(null, i);
            }
        });
    },
    logConnectionStates: function (hub, callback) {
        _this = this;
        _this.callback = callback;
        _this.hub = hub;
        _this.logging = true;

        hub.connectionSlow(function () {
            _this.state = "slow";
            if (_this.logging) console.log('%s [State] Connection slow', hub.url);
            if (callback) callback("slow");
        });

        hub.stateChanged(function (change) {
            _this.state = _this.stateName(change.newState);
            if (_this.logging) console.log('%s [State] %s', hub.url, _this.stateName(change.newState));
            if (callback) callback(_this.stateName(change.newState));
        });

        if (callback) callback(_this.stateName(hub.state));
        if (_this.logging) console.log('%s [State] %s', hub.url, _this.stateName(hub.state));

        return {
            start: function () {
                _this.logging = true;
            },
            stop: function () {
                _this.logging = false;
            }
        };
    },
    forceReconnect: function (hub, callback, timeout) {
        _this = this;
        _this.tryingToReconnect = true;

        timeout = timeout ? timeout * 1000 : 5000;

        function connect() {
            console.log('%s [Force Reconnect] Establishing a new connection', hub.url);
            hub.start().done(function () {
                console.log('%s [Force Reconnect] Connection started with id %s', hub.url, hub.id);
                if (callback) callback();
            });
        }

        hub.disconnected(function () {
            if (_this.tryingToReconnect) {
                console.log('%s [Force Reconnect] Disconnection detected. Attempting to reconnect in %d second(s)...', hub.url, timeout / 1000);
                setTimeout(function () {
                    connect();
                }, timeout);
            }
        });

        return {
            start: function () {
                _this.tryingToReconnect = true;
                connect();
                return this;
            },
            stop: function () {
                _this.tryingToReconnect = false;
                hub.stop();
                console.log('%s [Force reconnect] Connection stopped.', hub.url);
                return this;
            }
        }
    }
};

var signalR = new signalR();