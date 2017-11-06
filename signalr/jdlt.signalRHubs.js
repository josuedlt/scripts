var signalR = function () {};
signalR.prototype = {
    connectToHub: function (url, callback) {
        this.connectToHubs([url], function (hubs) {
            callback(hubs[0]);
        });
    },
    connectToHubs: function (urls, callback) {
        var hubs = [];
        urls.forEach(function (url) {
            $.ajax({
                async: false,
                cache: false,
                dataType: 'script',
                url: url + '/signalr/hubs',
                complete: function () {
                    h = $.hubConnection(url);
                    h.createHubProxies();
                    hubs.push(h);
                    if (hubs.length == urls.length)
                        callback(hubs);
                }
            });
        });
    },
    onStateChanged: function (hub, callback) {
        _this = this;
        _this.stateChangedCallback = callback;

        // Get connection state name.
        stateName = function (state) {
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
        }

        hub.connectionSlow(function () {
            if (_this.logging) console.log('%s connection slow');
        });

        hub.stateChanged(function (change) {
            if (_this.logging) {
                console.log('%s state changed from %s to %s', hub.url, stateName(change.oldState),
                    stateName(change.newState));
            }

            _this.change = {
                newState: stateName(change.newState),
                oldState: stateName(change.oldState)
            };
            if (_this.stateChangedCallback) _this.stateChangedCallback(_this.change);
        });

        _this.change = {
            newState: stateName(hub.state)
        };

        return {
            start: function () {
                _this.logging = true;
            },
            stop: function () {
                _this.logging = false;
            },
            getState: function () {
                return _this.change.newState;
            }
        }
    },
    forceReconnect: function (hub, callback, timeout) {
        _this = this;
        _this.timeout = timeout ? timeout : 5000;
        _this.reconnectCallback = callback;

        function connect() {
            hub.start().done(function () {
                console.log('%s [Force Reconnect] Connection started with id %s', hub.url, hub.id);
                if (typeof _this.reconnectCallback != 'undefined')
                    _this.reconnectCallback();
            });
        }

        hub.disconnected(function () {
            if (_this.tryingToReconnect) {
                console.log('%s [Force Reconnect] Reconnecting in %d milliseconds...', hub.url, _this.timeout);
                setTimeout(function () {
                    connect();
                }, _this.timeout);
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