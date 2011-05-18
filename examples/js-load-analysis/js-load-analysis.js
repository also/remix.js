function createNest() {
    var nest = new Nest(document.getElementById('apiKey').value);
    return nest;
}
function analyzeFile (file) {
    console.log('analyzing file', file);
    nest = createNest();
    nest.analyzeFile(file, nest.guessType(file), {
        onload: function (result) {
            var response = result.response;
            document.getElementById('upload').innerText = JSON.stringify(response);
            if (response.track && response.track.audio_summary) {
                nest.loadAnalysis(response.track.audio_summary.analysis_url, {
                    onload: function (result) {
                        document.getElementById('analysis').innerText = JSON.stringify(result);
                    }
                });
            }
        }
    });
}
