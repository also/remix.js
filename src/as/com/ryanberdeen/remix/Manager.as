package com.ryanberdeen.remix {
    import com.adobe.serialization.json.JSON;
    import com.ryanberdeen.audio.ISampleSource;
    import com.ryanberdeen.audio.RangeSampleSource;
    import com.ryanberdeen.audio.SoundSampleSource;
    import com.ryanberdeen.audio.SourceList;
    import com.ryanberdeen.remix.filter.IFilterFactory;
    import com.ryanberdeen.remix.filter.SoundTouchFilterFactory;

    import flash.media.Sound;

    public class Manager {
        private var sourceDescriptors:Array;

        private var filterFactories:Object = {
            'touch': new SoundTouchFilterFactory()
        }

        public function setRemixString(string:String):void {
            sourceDescriptors = JSON.decode(string);
        }

        public function buildSourceList(sound:Sound):SourceList {
            var sources:Array = [];
            var soundSampleSource:SoundSampleSource = new SoundSampleSource(sound);
            for (var i:int = 0; i < sourceDescriptors.length - 1; i++) {
                var item:Array = sourceDescriptors[i];
                var startOffset:Number = Math.round(Number(item[0]) * 44100);
                var endOffset:Number = Math.round(Number(item[1]) * 44100);
                var length:Number = endOffset - startOffset;
                var range:RangeSampleSource = new RangeSampleSource(soundSampleSource, startOffset, length);
                var source:ISampleSource = range;
                if (item.length > 2) {
                    var options:Object = item[2];
                    var filterSpecs:Object = options.filters;
                    if (filterSpecs) {
                        for each (var filterSpec:Object in filterSpecs) {
                            var factory:IFilterFactory = filterFactories[filterSpec.name];
                            source = factory.createFilter(source, filterSpec.options);
                        }
                    }
                }
                sources.push(source);
            }

            var result:SourceList = new SourceList();
            result.sources = sources;
            return result;
        }
    }
}
