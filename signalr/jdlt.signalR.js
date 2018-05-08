var signalR = function () { };
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
    logConnectionStates: function (hub, callback) {

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

        _this = this;
        _this.hub = hub;
        _this.callback = callback;
        _this.state;

        hub.connectionSlow(function () {
            _this.state = "slow";
            if (_this.logging) console.log('%s connection slow', hub.url);
            if (callback) callback("slow");
        });

        hub.stateChanged(function (change) {
            _this.state = stateName(change.newState);
            if (_this.logging) console.log('%s state changed from %s to %s', hub.url, stateName(change.oldState), stateName(change.newState));
            if (callback) callback(stateName(change.newState));
        });

        return {
            start: function () {
                _this.logging = true;
                if (_this.callback) callback(stateName(_this.hub.state));
            },
            stop: function () {
                _this.logging = false;
            }
        }
    },
    forceReconnect: function (hub, callback) {
        _this = this;

        hub.start().done(function () {
            console.log("%s connected with id %s", hub.url, hub.id)

            hub.disconnected(function () {
                if (_this.tryingToReconnect)
                    setTimeout(function () {
                        _this.forceReconnect(hub, callback);
                    }, 5000);
            });

            if (callback) callback();
        });

        return {
            start: function () {
                _this.tryingToReconnect = true;
                return this;
            },
            stop: function () {
                _this.tryingToReconnect = false;
                hub.stop();
                return this;
            }
        }
    }
};

var signalR = new signalR();