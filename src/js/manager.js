var Remix = {
    init: function(apiKey) {
        if (apiKey) {
            localStorage.echoNestApiKey = apiKey;
        }
        swfobject.embedSWF('remix.swf', 'swf', '0', '0', '9.0.0', null, {apiKey: localStorage.echoNestApiKey}, {wmode: 'transparent'});

        this._tracks = [];
        this._trackMap = {};

        // add selection and sorting functions to global scope
        extend(window, selection);
        extend(window, sorting);
    },

    apiKeyRequired: function () {
        return !localStorage.echoNestApiKey;
    },

    onError: function(message) {},

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
            this.onTrackAdded(track);
        }
        track.state = state;
        if (state == 'sound_loading') {
            track.file = arg;
            this.onTrackSoundLoading(track);
        }
        else if (state == 'sound_loaded') {
            this.onTrackSoundLoaded(track);
        }
        else if (state == 'md5_calculated') {
            track.md5 = arg;
            var analysisString = localStorage['analysis_' + track.md5];
            if (analysisString) {
                track.rawAnalysis = JSON.parse(analysisString);
                track.analysis = new AudioAnalysis(track.rawAnalysis);
                track.analysis.track = track;
                this.onTrackAnalysisLoaded(track);
            }
            else {
                this._swf.loadAnalysis(trackId);
            }
        }
        else if (state == 'analysis_loading') {
            this.onTrackAnalysisLoading(track);
        }
        else if (state == 'analysis_loaded') {
            track.rawAnalysis = arg;
            track.analysis = new AudioAnalysis(track.rawAnalysis);
            track.analysis.track = track;
            localStorage['analysis_' + track.md5] = JSON.stringify(track.rawAnalysis);
            this.onTrackAnalysisLoaded(track);
        }
    },

    onTrackAdded: function (track) {},

    onTrackSoundLoading: function (track) {},

    onTrackSoundLoaded: function (track) {},

    onTrackAnalysisLoading: function (track) {},

    onTrackAnalysisLoaded: function (track) {},

    togglePlayPause: function () {
        this._swf.togglePlayPause();
    },

    __setProgress: function (progress, sourceIndex, sourcePosition) {
        this.onPlayerProgress(progress, sourceIndex, sourcePosition);
    },

    onPlayerProgress: function (progress, sourceIndex, sourcePosition) {},

    remix: function(aqs) {
        try {
            if (!aqs) {
                Remix.onError('remix must return an array of audio quanta');
                return;
            }

            this.mixSpec = [];
            for (var i = 0; i < aqs.length; i++) {
                var aq = aqs[i];
                if (aq.end < aq.start) {
                    Remix.onError('end position ' + i + ' is before start position');
                    return;
                }
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
            Remix.onError(e);
        }
    }
};

if (!window.localStorage) {
    window.localStorage = {};
}

if (''.toJSON) {
    JSON.stringify = Object.toJSON;
    JSON.parse = JSON.parse || function(s) { return s.evalJSON(true); };
}

FilteredAudioQuantum.addFilter('touch');
