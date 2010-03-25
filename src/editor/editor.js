var Editor = {
    init: function (apiKey) {
        extend(Remix, {
            onError: this._onError,
            onPlayerProgress: this._onPlayerProgress
        });
        Remix.init(apiKey);

        this._snips = {};

        this._remixJsElt = document.getElementById('remixJs');
        this._progressElt = document.getElementById('progress');
    },

    _onError: function(message) {
        alert(message);
    },

    _onPlayerProgress: function(progress, sourceIndex, sourcePosition) {
        if (sourceIndex != this._sourceIndex) {
            Remix.log(sourceIndex);
            this._sourceIndex = sourceIndex;
        }
        Editor._progressElt.style.width = 100 * progress + '%';
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
