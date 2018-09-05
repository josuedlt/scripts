/**
 *  Requires Angular & ngStorage:
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.8/angular.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/ngStorage/0.3.11/ngStorage.min.js"></script> 

    Usage: 
    angular.module('app', ['ngStorage', 'nisdAuthorization'])

    <div ng-if="$storage.auth">Authenticated User</div>
    <div ng-if="!$storage.auth">Guest User</div>
 */

var app = angular.module('nisdAuthorization', ['ngStorage'])
    .config(($httpProvider) => {
        $httpProvider.interceptors.push('AuthorizationInterceptor');
    })
    .factory('AuthorizationInterceptor', ($localStorage, $q) => {
        function errorHandler(response) {
            if (response.status == 401) {
                delete $localStorage.auth;
            }
        }
        return {
            request: (config) => {
                if ($localStorage.auth)
                    config.headers['Authorization'] = 'Bearer ' + $localStorage.auth.token;
                return config;
            },
            responseError: (response) => {
                $localStorage.error = response.data;
                errorHandler(response);
                return $q.reject(response);
            }
        }
    })
    .factory('LoginService', ($localStorage, $http, $q) => {
        var baseUrl = "https://integration.nisd.net/"

        var _loggedIn = [];
        function announceLoggedIn(message) {
            _loggedIn.forEach((callback) => { callback(message); }, this);
        }

        return {
            onLoggedIn: function (callback) {
                _loggedIn.push(callback);
            },
            login: function (loginData) {
                return $q(function (resolve, reject) {
                    $http.post(baseUrl + "api/User/Token", loginData)
                        .then(function (response) {
                            var auth = {
                                token: response.data.AccessToken,
                                user: response.data.Username
                            }
                            $localStorage.auth = auth;
                            announceLoggedIn(auth.user);
                            resolve(auth);
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
                            var info = response.data;
                            $localStorage.auth.info = info;
                            resolve(info);
                        }, function (response) {
                            reject(response);
                        })
                })
            }
        }
    })
    .run(function ($rootScope, $localStorage) {
        $rootScope.$storage = $localStorage;
    });