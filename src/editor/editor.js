var Remix = {
    init: function(apiKey) {
        if (apiKey) {
            localStorage.echoNestApiKey = apiKey;
        }
        swfobject.embedSWF('remix.swf', 'swf', '0', '0', '9.0.0', null, {apiKey: localStorage.echoNestApiKey}, {wmode: 'transparent'});
        this._remixJsElt = document.getElementById('remixJs');
        this._progressElt = document.getElementById('progress');

        this._tracks = [];
        this._trackMap = {};

        if (location.hash) {
            Remix._loadScript();
        }

        // add selection and sorting functions to global scope
        extend(window, selection);
        extend(window, sorting);
    },

    apiKeyRequired: function () {
        return !localStorage.echoNestApiKey;
    },

    onError: function(message) {
        alert(message);
    },

    __init: function() {
        this._swf = document.getElementById('swf');
    },

    __setTrackState: function (trackId, state, arg) {
        console.log('state: ', trackId, state, arg);
        var track = this._trackMap[trackId];
        if (!track) {
            track = {id: trackId};
            this._trackMap[trackId] = track;
            this._tracks.push(track);
        }
        track.state = state;
        if (state == 'sound_loading') {
            track.file = arg;
        }
        else if (state == 'md5_calculated') {
            track.md5 = arg;
            var analysisString = localStorage['analysis_' + track.md5];
            if (analysisString) {
                track.rawAnalysis = JSON.parse(analysisString);
                track.analysis = new AudioAnalysis(track.rawAnalysis);
                track.analysis.track = track;
            }
            else {
                this._swf.loadAnalysis(trackId);
            }
        }
        else if (state == 'analysis_loaded') {
            track.rawAnalysis = arg;
            track.analysis = new AudioAnalysis(track.rawAnalysis);
            track.analysis.track = track;
            localStorage['analysis_' + track.md5] = JSON.stringify(track.rawAnalysis);
        }
    },

    __setAnalysis: function(analysis) {
        localStorage.remixAnalysis = JSON.stringify(analysis);
        this.analysis = new AudioAnalysis(analysis);
    },

    run: function() {
        var remixCalled = false;
        // TODO use copies
        var prefix = 'var play = function () {Remix._doRemix.apply(Remix, arguments); remixCalled = true;};var tracks = Remix._tracks;var track = tracks[0]; var analysis = track.analysis;'
        try {
            eval(prefix + '\n' + this._remixJsElt.value);
            if (!remixCalled) {
                Remix.onError('Call the play() function to play your remix');
            }
        }
        catch(e) {
            alert(e);
            return;
        }
    },

    togglePlayPause: function () {
        this._swf.togglePlayPause();
    },

    _doRemix: function(aqs) {
        try {
            if (!aqs) {
                alert('remix must return an array of audio quanta');
                return;
            }

            if (aqs.length == 0) {
                alert('remix must return at least one audio quantum');
                return;
            }

            this.mixSpec = [];
            remixDuration = 0;
            for (var i = 0; i < aqs.length; i++) {
                var aq = aqs[i];
                if (aq.end <= aq.start) {
                    alert('end position ' + i + ' is not after start position');
                    return;
                }
                remixDuration += aq.end - aq.start;
                var spec = [aq.container.analysis.track.id, aq.start, aq.end];
                if (aq.filters) {
                    spec.push({filters: aq.filters});
                }
                this.mixSpec.push(spec);
            }


            if (this.onRemix) {
                //this.onRemix();
            }
            this._swf.setRemixString(JSON.stringify(this.mixSpec));
        }
        catch (e) {
            alert(e);
        }
    },

    __setProgress: function(progress) {
        this._progressElt.style.width = 100 * progress + '%';
    },

    _scriptLoaded: function() {
        if (remix) {
            this._remixJsElt.value = remix;
        }
        else {
            alert('Remix function not found in script.');
        }
    },

    _loadScript: function() {
        remix = null;
        document.write('<script src="' + location.hash.substring(1) + '" onload="Remix._scriptLoaded();"><' + '/script>');
    }
};

FilteredAudioQuantum.addFilter('touch');
