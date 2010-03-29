var Editor = {
    init: function (apiKey) {
        extend(Remix, {
            onError: this._onError
        });
        Remix.init(apiKey);

        this._snips = {};

        this._remixJsElt = document.getElementById('remixJs');
    },

    _onError: function(message) {
        alert(message);
    },

    getScript: function () {
        return this._remixJsElt.value;
    },

    run: function() {
        var script = this.getScript();
        if (!script) {
            return;
        }
        var remixCalled = false;
        var play = function () {
            Remix.remix.apply(Remix, arguments);
            remixCalled = true;
        };
        // TODO use copies
        var tracks = Remix._tracks;
        var track = this.selectedTrack || tracks[0];
        if (!track) {
            Remix.onError('No tracks available.');
            return;
        }
        var selection = track.selection;
        var analysis = track.analysis;
        var snips = this._snips;
        try {
            eval(script);
            if (!remixCalled) {
                Remix.onError('Call the play() function to play your remix');
            }
        }
        catch(e) {
            Remix.onError(e);
        }
    }
};
