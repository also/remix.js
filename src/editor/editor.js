var Remix = {
    init: function(apiKey) {
        swfobject.embedSWF('remix.swf', 'swf', '400', '120', '9.0.0', null, {apiKey: apiKey});
        this._remixJsElt = document.getElementById('remixJs');
        this._progressElt = document.getElementById('progress');

        if (location.hash) {
            Remix._loadScript();
        }

        // add selection and sorting functions to global scope
        extend(window, selection);
        extend(window, sorting);
    },

    __init: function() {
        this._swf = document.getElementById('swf');
    },

    __setAnalysis: function(analysis) {
        this.analysis = new AudioAnalysis(analysis);
    },

    __remix: function() {
        try {
            eval(this._remixJsElt.value);
        }
        catch(e) {
            alert(e);
            return;
        }
        if (remix == null) {
            alert('remix function not found!');
            return;
        }
        try {
            var aqs = remix(this.analysis);

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
                var spec = [aq.start, aq.end];
                if (aq.filters) {
                    spec.push({filters: aq.filters});
                }
                this.mixSpec.push(spec);
            }


            if (this.onRemix) {
                this.onRemix();
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
