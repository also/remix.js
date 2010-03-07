package com.ryanberdeen.remix.filter {
    import com.ryanberdeen.audio.ISampleSource;
    import com.ryanberdeen.soundtouch.SoundTouch;

    public class SoundTouchFilterFactory implements IFilterFactory {
        public const properties:Array = ['tempo', 'tempoChange', 'rate', 'rateChange', 'pitch', 'pitchOctaves', 'pitchSemitones'];

        public function createFilter(source:ISampleSource, options:Object):ISampleSource {
            var touch:SoundTouch = new SoundTouch();
            for each (var property:String in properties) {
                var value:Object = options[property];
                if (value) {
                    touch[property] = value;
                }
            }
            return new SoundTouchFilter(source, touch);
        }
    }
}
