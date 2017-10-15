function signalRHub(url, callback) {
    $.ajax({
        async: false,
        cache: false,
        dataType: 'script',
        url: url + '/signalr/hubs',
        complete: function() {
            h = $.hubConnection(url)
            h.createHubProxies();
            callback(h);
        }
    })
}

var signalRHubs = function (urls, callback) {
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
        })
    })
}