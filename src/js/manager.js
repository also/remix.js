var Remix = {
    init: function(apiKey) {
        if (apiKey) {
            localStorage.echoNestApiKey = apiKey;
        }
        swfobject.embedSWF('remix.swf', 'swf', '0', '0', '9.0.0', null, {apiKey: localStorage.echoNestApiKey}, {wmode: 'transparent'});

        this._tracks = [];
        this._trackMap = {};

        this._searchMap = {};

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

    getTrack: function(trackId) {
        var track = this._trackMap[trackId];
        if (!track) {
            track = {id: trackId};
            this._trackMap[trackId] = track;
            this._tracks.push(track);
            this.onTrackAdded(track);
        }
        return track;
    },

    __setTrackState: function (trackId, state, arg) {
        console.log('state: ', trackId, state, arg);
        var track = this.getTrack(trackId);
        track.state = state;
        if (state == 'sound_loading') {
            track.file = arg;
            this.onTrackSoundLoading(track);
        }
        else if (state == 'sound_loaded') {
            track.sound = arg;
            track.soundLoaded = true;
            this.onTrackSoundLoaded(track);
        }
        else if (state == 'md5_calculated') {
            track.md5 = arg;
            track.key = arg;
            this._loadAnalysis(track);
        }
        else if (state == 'analysis_loading') {
            this.onTrackAnalysisLoading(track);
        }
        else if (state == 'analysis_loaded') {
            track.rawAnalysis = arg;
            track.analysis = new AudioAnalysis(track.rawAnalysis);
            track.analysis.track = track;
            localStorage['analysis_' + track.key] = JSON.stringify(track.rawAnalysis);
            track.analysisLoaded = true;
            this.onTrackAnalysisLoaded(track);
        }
    },

    _loadAnalysis: function (track) {
        var analysisString = localStorage['analysis_' + track.key];
        if (analysisString) {
            track.rawAnalysis = JSON.parse(analysisString);
            track.analysis = new AudioAnalysis(track.rawAnalysis);
            track.analysis.track = track;
            track.analysisLoaded = true;
            this.onTrackAnalysisLoaded(track);
        }
        else {
            this._swf.loadAnalysis(track.id);
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

    __setPlayerState: function (state) {
        this['onPlayer' + state[0].toUpperCase() + state.substring(1)]();
    },

    onPlayerReady: function () {},

    onPlayerEmpty: function () {},

    onPlayerPlaying: function () {},

    onPlayerPaused: function () {},

    onPlayerComplete: function () {},

    search: function (params) {
        var search = {params: params};
        var searchId = this._swf.search(params);
        search.id = searchId;
        this._searchMap[searchId] = search;
        return search;
    },

    __setSearchState: function (searchId, state, arg) {
        console.log('search state: ', searchId, state, arg);
        var search = this._searchMap[searchId];
        if (state == 'echo_nest_error') {
            if (arg.description == 'no results') {
                this.onSearchNoResults(search);
            }
            else {
                search.error = arg;
                this.onSearchError(search);
            }
        }
        else if (state == 'error') {
            search.error = arg;
            this.onSearchError(search);
        }
        else if (state == 'complete') {
            search.results = arg;
            this.onSearchResults(search);
        }
    },

    onSearchResults: function (search) {},

    onSearchNoResults: function (search) {},

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
                var track = aq.track || aq.container.analysis.track;
                var spec = [track.id, aq.start, aq.end];
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
            throw e;
        }
    },

    load: function (url, enTrackId) {
        var trackId = this._swf.load(url, enTrackId);
        var track = this.getTrack(trackId);
        track.key = enTrackId;
        this._loadAnalysis(track);
        return track;
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
