var base = analysis.bars[20].children()[1].children()[0];
var numTones = 8;
var shift = -4;
var scale = 1;

var tones = [];

for (var t = 0; t < numTones; t++) {
    tones[t] = base.touch({pitchSemitones: (t + shift) * scale});
}

var result = []
for (var i = 0; i < 100; i++) {
    result.push(tones[Math.floor(Math.random() * tones.length)]);
}

play(result);
