$(document).ready(function () {
    // Log connection state changes.
    $.connection.hub.stateChanged(function (change) {
         function stateName (state) {
            switch (state) {
                case ($.signalR.connectionState.connecting): return "connecting";
                case ($.signalR.connectionState.connected): return "connected";
                case ($.signalR.connectionState.disconnected): return "disconnected";
                case ($.signalR.connectionState.reconnecting): return "reconnecting";
            }
        }
        console.log('SignalR: connection state changed from %s to %s', stateName(change.oldState), stateName(change.newState));
    });

    $.connection.connectionsHub.client = {
        reload: function() {
            location.reload(true);
        },
        redirect: function (path) {
            location.href = path;
        },
        notify: function (message) {
            alert(message);
        },
        speak: function (phrase) {
            speak(phrase);
        }
    };

    connectToHub = function () {
        $.connection.hub.start().done(function () {
            console.log('SignalR: connection id is %s', $.connection.hub.id);

            // Stop the connection gracefully before unload.
            window.onbeforeunload = function () {
                $.connection.hub.stop();
            };

            // If hub becomes disconnected, attempt to reconnect in 5 seconds.
            $.connection.hub.disconnected(function () {
                setTimeout(function () {
                    connectToHub();
                }, 5000);
            });
        });
    };
    connectToHub();
});

// Use text-to-speech to speak a message.
var speak = function (phrase) {
    if (window.SpeechSynthesisUtterance != undefined) {
        var utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = "en-us";
        window.speechSynthesis.speak(utterance);
    }
}
