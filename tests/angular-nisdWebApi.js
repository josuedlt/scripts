angular.module('ngNisdWebApi', [])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    }])
    .factory('authInterceptor', function ($localStorage, $log, $q) {
        function errorHandler(response) {
            if (response.status == 401) {
                delete $localStorage.auth.token;
                delete $localStorage.auth.info;
            }
        }
        return {
            'request': function (config) {
                $log.log("Request config", config);
                if ($localStorage.auth)
                    config.headers['Authorization'] = 'Bearer ' + $localStorage.auth.token;
                return config;
            },
            'requestError': function (response) {
                $log.error("Request error", response);
                $localStorage.error = response.data;
                errorHandler(response);
                return $q.reject(response);
            },
            'response': function (config) {
                $log.log('Response config', config);
                delete $localStorage.error;
                return config;
            },
            'responseError': function (response) {
                $log.error("Response error", response);
                $localStorage.error = response.data;
                errorHandler(response);
                return $q.reject(response);
            }
        }
    })
    .factory('authFactory', ['$localStorage', '$http', '$q', function ($localStorage, $http, $q) {
        var baseUrl = "https://integration.nisd.net/"

        var _loggedIn = [];
        announceLoggedIn = function (message) {
            _loggedIn.forEach(function (callback) {
                callback(message);
            }, this);
        }

        return {
            onLoggedIn: function (callback) {
                _loggedIn.push(callback);
            },
            login: function (loginData) {
                return $q(function (resolve, reject) {
                    $http.post(baseUrl + "api/User/Token", loginData)
                        .then(function (response) {
                            var token = response.data.AccessToken;
                            $localStorage.auth = {
                                token: token
                            };
                            announceLoggedIn();
                            resolve(token);
                        }, function (response) {
                            reject(response);
                        })
                })
            },
            logout: function () {
                delete $localStorage.auth;
            },
            getInfo: function () {
                return $q(function (resolve, reject) {
                    $http.get(baseUrl + "api/User/Info")
                        .then(function (response) {
                            resolve(response.data);
                        }, function (response) {
                            reject(response);
                        })
                })
            }
        }
    }])
    .run(function ($rootScope, $localStorage) {
        $rootScope.$storage = $localStorage;
    });