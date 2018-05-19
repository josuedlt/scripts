var signalR = function () {};
signalR.prototype = {
    version: 1.0,

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
        var _this = this;
        return new Promise( function(resolve){
            _this.connectToHubs([url], function (hubs) {
                if (callback) callback(hubs[0]);
                resolve(hubs[0]);
            })    
        })
    },

    connectToHubs: function (urls, callback) {
        return new Promise(function (resolve, reject) {
            var hubs = [];

            function addHub(h, i) {
                hubs[i] = h;
                if (hubs.length == urls.length) {
                    if (callback) callback(hubs);
                    resolve(hubs);
                }
            }

            urls.forEach(function (url, i) {
                try {
                    $.ajax({
                            async: false,
                            //cache: false,
                            dataType: 'script',
                            //timeout: 3000,
                            url: url + '/signalr/hubs',
                        })
                        .done(function () {
                            h = $.hubConnection(url);
                            h.createHubProxies();
                            addHub(h, i);
                        })
                        .fail(function (a, b, c, d) {
                            console.log(a, b, c, d);
                        });
                } catch (e) {

                    console.log(e);
                }
            });

        });
    },

    onLoading: function (hub, callback, logToConsole) {
        _this = this;
        count = 0;
        logToConsole = logToConsole ? logToConsole : true;

        updateLoading = function (loading) {
            if (logToConsole) console.log('%s [Loading] %o', hub.url, loading);
            if (callback) callback(count);
        };

        jQuery.ajaxSetup({
            beforeSend: function (xhr) {
                count += 1;
                if (count == 1) updateLoading(true);
            },
            complete: function (xhr, status) {
                count -= 1;
                if (count == 0) updateLoading(false);
            }
        });
    },

    onStateChanged: function (hub, callback, logToConsole) {
        _this = this;

        return new Promise(function (resolve) {
            function updateState(state) {
                if (logToConsole) console.log('%s [State] %s', hub.url, state);
                if (callback) callback(state);
                resolve(state);
            }

            hub.connectionSlow(function () {
                updateState("slow");
            });

            hub.stateChanged(function (change) {
                updateState(_this.stateName(change.newState));
            });

            updateState(_this.stateName(hub.state));
        });
    },
    forceReconnect: function (hub, callback, logToConsole, timeout) {
        return new Promise(function (resolve) {
            connectToHub = function () {
                if (logToConsole) console.log('%s [Force Reconnect] Attempting to connect', hub.url);
    
                hub.start().done(function () {
                    if (logToConsole) {
                        console.log('%s [Force Reconnect] Client Id: %s', hub.url, hub.id);
                        console.log('%s [Force Reconnect] Transport: %s', hub.url, hub.transport.name);
                    }
    
                    if (callback) callback();
                    resolve();
                });
            };
    
            // If hub becomes disconnected, attempt to reconnect in 5 seconds.
            hub.disconnected(function () {
                if (logToConsole) console.log('%s [Force Reconnect] Disconnection detected', hub.url);
                if (logToConsole) console.log('%s [Force Reconnect] Trying again in %d ms', hub.url, timeout);
                setTimeout(function () {
                    connectToHub();
                }, timeout);
            })
    
            connectToHub();
        })
    }
};

var signalR = new signalR();