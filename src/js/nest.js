// The Echo Nest API analyze support.
// This has nothing to do with https://github.com/echonest/nestjs (I made this first!).

function Nest(api_key) {
    this.api_key = api_key;
}

Nest.prototype = {
    fixupAnalysisUrl: function(url) {
        // undocumented api feature: returns analysis data, works with cors
        return 'http://developer.echonest.com' + url.substr(46);
    },

    guessType: function(file) {
        return file.name.split('.').slice(-1)[0];
    },

    analyzeFile: function(file, type, options) {
        var form = new FormData();
        form.append('api_key', this.api_key);
        form.append('track', file);
        form.append('filetype', type);
        form.append('bucket', 'audio_summary');
        var request = new XMLHttpRequest();
        request.open('POST', 'http://developer.echonest.com/api/v4/track/upload');
        request.onload = _.bind(function (e) {
            var result = JSON.parse(request.responseText);
            result.response.track.audio_summary.analysis_url = this.fixupAnalysisUrl(result.response.track.audio_summary.analysis_url);
            options.onload(result);
        }, this);
        request.onerror = function (e) {
            options.onerror(e);
        }
        request.send(form);
        return request;
    },

    analyzeUrl: function(url, options) {
        var form = new FormData();
        form.append('api_key', this.api_key);
        form.append('url', url);
        form.append('bucket', 'audio_summary');
        var request = new XMLHttpRequest();
        request.open('POST', 'http://developer.echonest.com/api/v4/track/upload');
        request.onload = _.bind(function (e) {
            var result = JSON.parse(request.responseText);
            result.response.track.audio_summary.analysis_url = this.fixupAnalysisUrl(result.response.track.audio_summary.analysis_url);
            options.onload(result);
        }, this);
        request.onerror = function (e) {
            options.onerror(e);
        }
        request.send(form);
        return request;
    },

    getTrackProfile: function (md5, options) {
        var request = new XMLHttpRequest();
        // fuck the echo nest api so hard
        request.open('GET', 'http://developer.echonest.com/api/v4/track/profile?api_key=' + this.api_key + '&format=json&md5=' + md5 + '&bucket=audio_summary&callback=' + new Date().getTime());
        request.onload = _.bind(function (e) {
            var result = JSON.parse(request.responseText);
            if (result.response.track && result.response.track.status == 'complete') {
                result.response.track.audio_summary.analysis_url = this.fixupAnalysisUrl(result.response.track.audio_summary.analysis_url);
            }
            options.onload(result);
        }, this);
        request.onerror = function (e) {
            options.onerror(e);
        }
        request.send();
    },

    loadAnalysis: function (url, options) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onload = function (e) {
            options.onload(JSON.parse(request.responseText));
        }
        request.onerror = function (e) {
            options.onerror();
        }
        request.send();
    }
};
