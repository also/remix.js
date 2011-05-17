// see tonic.py,
// Originally by Adam Lindsay, 2008-09-15.

var tonic = analysis.key.value;
var chunks = analysis.tatums;
var segs = analysis.segments.that(havePitchMax(tonic)).that(overlapStartsOf(chunks));
play(chunks.that(overlapEndsOf(segs)));
