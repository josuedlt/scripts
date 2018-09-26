var app = angular.module('nisdArmoredService', [])
    .factory('ArmoredService', ($http) => {
        var baseUrl = 'https://integration.nisd.net';

        function SignalR() {
            var handlers = {};

            function fire(key, o) {
                if (handlers[key])
                    handlers[key].forEach(function (fn) { fn(o); });
            }

            signalR.connectToHub(baseUrl)
                .then((hub) => {
                    proxy = hub.proxies.armoredservicehub;
                    proxy.client = {
                        refresh() {
                            fire("refresh");
                        }
                    };
                    signalR.forceReconnect(hub).start();
                });

            // Connect to webservices to get connection updates
            signalR.connectToHub('https://webservices.nisd.net')
                .then((hub) => {
                    var connections = [];
                    var proxy = hub.proxies.connectionshub;
                    proxy.client = {
                        hasConnected: function (c) {
                            if (c.ConnectionId == hub.id) {
                                _id = hub.id;
                                proxy.server.getConnections().done(function (connections) {
                                    _connections = connections;
                                    fire('connections', _connections);
                                });
                            } else {
                                var i = _.indexOf(_.map(_connections, 'ConnectionId'), c.ConnectionId)
                                if (i > -1) _connections[i] = c;
                                else _connections.push(c);
                                fire('connections', _connections);
                            }
                        },
                        hasDisconnected: function (c) {
                            if (c.ConnectionId == hub.id) {

                            } else {
                                var i = _.indexOf(_.map(_connections, 'ConnectionId'), c.ConnectionId);
                                if (i > -1) _connections.splice(i, 1);
                            }

                            fire('connections', _connections);
                        },
                        hasUpdatedPosition: function (c, p) {
                            var i = _.indexOf(_.map(_connections, 'ConnectionId'), c.ConnectionId)
                            if (i > -1) _connections[i].Position = p;

                            fire('connections', _connections);
                        }
                    }
                    signalR.forceReconnect(hub).start();
                })

            return {
                on: function (key, fn) {
                    if (!handlers[key]) handlers[key] = [];
                    handlers[key].push(fn);
                }
            };
        }

        return {
            // API Calls 
            GetLocations: function () {
                return $http.get(baseUrl + '/api/ArmoredService/GetLocations');
            },
            GetSubmittedDepositBags: function () {
                return $http.get(baseUrl + '/api/ArmoredService/GetPendingDepositBags');
            },
            GetCollectedDepositBags: function (date) {
                if (date) {
                    return $http.get(baseUrl + '/api/ArmoredService/GetCollectedDepositBags/?id=' + date.toJSON());
                }
            },
            SignalR: SignalR(),
        }
    })