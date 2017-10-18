var signalR = function (hubPath) {
    var _this = this;

    // Configure subscribers...
    _this.keyHandlers = {};
    _this.fire = function (key, o) {
        if (_this.keyHandlers[key])
            _this.keyHandlers[key].forEach(function (fn) {
                fn(o)
            });
    }
    _this.tryingToReconnect = true;
    _this.proxies;

    // Configure connection
     _this.prepareConnection = function () {
        _this.connection = $.hubConnection(hubPath);
        _this.proxies = _this.connection.createHubProxies();
        _this.fire('ready', _this.proxies);
        
        _this.connection.connectionSlow(function () {
            _this.fire('state', {
                name: 'connection slow'
            });
        });

        _this.connection.stateChanged(function (change) {
            function stateName(state) {
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
            _this.fire('state', {
                name: stateName(change.newState)
            });
        })

        _this.connection.disconnected(function () {
            if (_this.connection.lastError) {
                _this.fire('state', {
                    name: 'error',
                    resason: _this.connection.lastError.message
                })
            }

            if (_this.tryingToReconnect) {
                setTimeout(function () {
                    _this.connectToHub();
                }, 5000);
            }
        });

        _this.connectToHub = function () {
            if (_this.tryingToReconnect) {
                _this.connection.start().done(function () {
                    window.onbeforeunload = function () {
                        _this.connection.stop();
                    };
                })
            }
        }
        
        _this.connectToHub();
    }

    $.ajax({
        async: false,
        dataType: 'script',
        url: hubPath + '/signalr/hubs',
        complete: _this.prepareConnection
    });

    return {
        on: function (key, fn) {
            if (!_this.keyHandlers[key])
                _this.keyHandlers[key] = new Array;

            _this.keyHandlers[key].push(fn);
            return this;
        },
        start: function () {
            _this.tryingToReconnect = true;
            if (_this.connection) _this.connectToHub();
            return this;
        },
        stop: function () {
            _this.tryingToReconnect = false;
            _this.connection.stop();
            return this;
        }
    }
};