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

    // Configure connection
    _this.prepareConnection = function () {
        _this.connection = $.hubConnection(hubPath);
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
            _this.fire('state', stateName(change.newState));
        })

        _this.connectToHub = function () {
            _this.connection.start().done(function () {
                _this.fire('ready', _this.connection.createHubProxies());

                window.onbeforeunload = function () {
                    _this.connection.stop();
                };
                _this.connection.disconnected(function () {
                    setTimeout(function () {
                        _this.connectToHub();
                    }, 5000);
                });
            })

        }
        
        _this.connectToHub();
    }

    if (!hubPath) hubPath = "https://webservices.nisd.net";
    $.ajax({
        async: false,
        dataType:'script',
        url: hubPath + '/signalr/hubs',
        success: _this.prepareConnection
    });

    return {
        on: function (key, fn) {
            if (!_this.keyHandlers[key])
                _this.keyHandlers[key] = new Array;

            _this.keyHandlers[key].push(fn);
            return this;
        }
    }
};