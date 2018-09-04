var app = angular.module('nisdArmoredService', [])
    .factory('ArmoredService', ($http) => {
        var baseUrl = 'https://integration.nisd.net/api/';

        return {
            // API Calls 
            GetLocations: function () {
                return $http.get(baseUrl + 'ArmoredService/GetLocations');
            },
            GetSubmittedDepositBags: function () {
                return $http.get(baseUrl + 'ArmoredService/GetPendingDepositBags');
            },
            GetCollectedDepositBags: function () {
                return $http.get(baseUrl + 'ArmoredService/GetCollectedDepositBags');
            },
        }
    })