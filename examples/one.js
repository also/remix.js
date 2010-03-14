// see one.py,
// By Ben Lacker, 2009-02-18.

var bars = analysis.bars;
var result = [];

for (var i = 0; i < bars.length; i++) {
    result.push(bars[i].children()[0]);
}

play(result);
