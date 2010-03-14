var Editor = {
    init: function (apiKey) {
        extend(Remix, {
            onError: this._onError,
            onPlayerProgress: this._onPlayerProgress
        });
        Remix.init(apiKey);

        this._remixJsElt = document.getElementById('remixJs');
        this._progressElt = document.getElementById('progress');

        if (location.hash) {
            this._loadScript();
        }
    },

    _onError: function(message) {
        alert(message);
    },

    _onPlayerProgress: function(progress, sourceIndex, sourcePosition) {
        if (sourceIndex != this._sourceIndex) {
            console.log(sourceIndex);
            this._sourceIndex = sourceIndex;
        }
        Editor._progressElt.style.width = 100 * progress + '%';
    },

    _scriptLoaded: function() {
        if (remix) {
            this._remixJsElt.value = remix;
        }
        else {
            Remix.onError('Remix function not found in script.');
        }
    },

    _loadScript: function() {
        remix = null;
        document.write('<script src="' + location.hash.substring(1) + '" onload="Editor._scriptLoaded();"><' + '/script>');
    },

    run: function() {
        var remixCalled = false;
        var play = function () {
            Remix.remix.apply(Remix, arguments);
            remixCalled = true;
        };
        // TODO use copies
        var tracks = Remix._tracks;
        var track = this.selectedTrack || tracks[0];
        var analysis = track.analysis;
        try {
            eval(this._remixJsElt.value);
            if (!remixCalled) {
                Remix.onError('Call the play() function to play your remix');
            }
        }
        catch(e) {
            this._onError(e);
            throw e;
            return;
        }
    }
};
