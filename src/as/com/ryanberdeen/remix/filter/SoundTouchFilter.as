package com.ryanberdeen.remix.filter {
    import flash.utils.ByteArray;
    import com.ryanberdeen.audio.ISampleSource;
    import com.ryanberdeen.soundtouch.FilterSupport;
    import com.ryanberdeen.soundtouch.SoundTouch;

    public class SoundTouchFilter extends FilterSupport implements ISampleSource {
        private var source:ISampleSource;
        private var sourcePosition:Number;
        private var multiplier:Number;
        private var _length:Number;

        public function SoundTouchFilter(source:ISampleSource, touch:SoundTouch) {
            super(touch);
            this.source = source;
            this.multiplier = touch.tempo * touch.rate;
            _length = Math.floor(source.length / multiplier);
            sourcePosition = 0;
        }

        override protected function fillInputBuffer(numFrames:int):void {
            var bytes:ByteArray = new ByteArray();
            var numFramesExtracted:uint = source.extract(bytes, numFrames, sourcePosition);
            sourcePosition += numFramesExtracted;
            inputBuffer.putBytes(bytes);
        }

        public function extract(target:ByteArray, numFrames:Number, startPosition:Number = -1):Number {
            fillOutputBuffer(numFrames);

            var numFramesExtracted:Number = Math.min(numFrames, outputBuffer.frameCount);

            outputBuffer.receiveBytes(target, numFramesExtracted);
            return numFramesExtracted;
        }

        public function get length():Number {
            return _length;
        }

        public function toSourcePosition(position:Number):Number {
            return source.toSourcePosition(Math.floor(position * multiplier));
        }
    }
}