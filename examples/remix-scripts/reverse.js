// see reverse.py

var chunks = analysis.beats;
var result = [];

for (var i = 0; i < chunks.length; i++) {
    result.unshift(chunks[i]);
}

play(result);
