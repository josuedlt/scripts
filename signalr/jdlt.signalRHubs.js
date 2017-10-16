var signalR = function () {};
signalR.prototype = {
    connectToHub: function (url, callback) {
        this.connectToHubs([url], (hubs) => {
            callback(hubs[0]);
        });
    },
    connectToHubs: (urls, callback) => {
        var hubs = [];
        urls.forEach((url) => {
            $.ajax({
                async: false,
                cache: false,
                dataType: 'script',
                url: url + '/signalr/hubs',
                complete: () => {
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
        _this = this;
        _this.callback = callback;
        _this.state;

        hub.connectionSlow(() => {
            if (_this.logging) console.log('%s connection slow');
        });

        hub.stateChanged((change) => {
            // Get connection state name.
            stateName = (state) => {
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
            _this.state = stateName(change.newState);

            if (callback) callback(stateName(change.oldState), stateName(change.newState));
            if (_this.logging) {
                console.log('%s state changed from %s to %s', hub.url, stateName(change.oldState),
                stateName(change.newState));
            }
        });

        return {
            start: function () {
                _this.logging = true;
            },
            stop: function () {
                _this.logging = false;
            },
            getState: function() {
                return _this.state
            }
        }

    },
    persistedConnection: function (hub) {
        _this = this;

        return {
            start: function () {
                _this.tryingToReconnect = true;
                hub.start().done(() => {
                    hub.disconnected(() => {
                        setTimeout(() => {
                            if (_this.tryingToReconnect)
                                _this.startPersistedConnection(hub);
                        }, 5000);
                    });
                });
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