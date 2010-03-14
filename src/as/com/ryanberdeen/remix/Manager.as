package com.ryanberdeen.remix {
    import com.adobe.serialization.json.JSON;
    import com.ryanberdeen.audio.ISampleSource;
    import com.ryanberdeen.audio.RangeSampleSource;
    import com.ryanberdeen.audio.SoundSampleSource;
    import com.ryanberdeen.audio.SourceList;
    import com.ryanberdeen.echonest.api.v3.alpha.AlphaApi;
    import com.ryanberdeen.echonest.api.v3.track.TrackApi;
    import com.ryanberdeen.remix.filter.IFilterFactory;
    import com.ryanberdeen.remix.filter.SoundTouchFilterFactory;

    import flash.external.ExternalInterface;
    import flash.media.Sound;

    public class Manager {
        public var trackApi:TrackApi;
        public var alphaApi:AlphaApi;
        private var tracks:Object;
        private var trackNum:int = 0;
        private var searches:Object;
        private var searchNum:int = 0;

        private var sourceDescriptors:Array;
        private var player:Player;

        private var filterFactories:Object = {
            'touch': new SoundTouchFilterFactory()
        }

        public function Manager(options:Object) {
            trackApi = new TrackApi();
            trackApi.apiKey = options.apiKey;
            alphaApi = new AlphaApi();
            alphaApi.apiKey = options.apiKey;
            tracks = {};
            searches = {};

            player = new Player(this);

            ExternalInterface.addCallback('loadAnalysis', loadAnalysis);
            ExternalInterface.addCallback('togglePlayPause', player.togglePlayPause);

            // FIXME method name mismatch
            ExternalInterface.addCallback('setRemixString', remix);
            ExternalInterface.addCallback('search', search);
            ExternalInterface.addCallback('load', load);
            callJs('init');
        }

        // TODO make private
        public function callJs(fn:String, ...args):* {
            args.unshift('Remix.__' + fn);
            return ExternalInterface.call.apply(ExternalInterface, args);
        }

        private function createTrack():Track {
            var id:String = 't' + trackNum++;
            var track:Track = new Track(this, id);
            tracks[id] = track;
            return track;
        }

        public function loadTrackFile():String {
            var track:Track = createTrack();
            track.loadFile();
            return track.id;
        }

        public function load(url:String, enTrackId:String):String {
            var track:Track = createTrack();
            track.load(url, enTrackId);
            return track.id;
        }

        public function search(params:Object):String {
            var id:String = 's' + searchNum++;
            var search:Search = new Search(this, id, params);
            search.load();
            return id;
        }

        internal function setTrackState(id:String, state:String, arg:Object):void {
            callJs('setTrackState', id, state, arg);
        }

        private function remix(string:String):void {
            try {
                setRemixString(string);
                player.preparePlayer(buildSourceList());
                player.play();
            }
            catch (e:Error) {
                errorHandler(e);
            }
        }

        public function setRemixString(string:String):void {
            sourceDescriptors = JSON.decode(string);
        }

        public function buildSourceList():SourceList {
            var sources:Array = [];
            for (var i:int = 0; i < sourceDescriptors.length; i++) {
                var item:Array = sourceDescriptors[i];
                var track:Track = tracks[item[0]];
                var startOffset:Number = Math.round(Number(item[1]) * 44100);
                var endOffset:Number = Math.round(Number(item[2]) * 44100);
                var length:Number = endOffset - startOffset;
                // TODO reuse sound sample sources
                var range:RangeSampleSource = new RangeSampleSource(new SoundSampleSource(track.sound), startOffset, length);
                var source:ISampleSource = range;
                if (item.length > 3) {
                    var options:Object = item[3];
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

        private function loadAnalysis(trackId:String):void {
            tracks[trackId].loadAnalysis();
        }

        public function errorHandler(e:Error):void {
            log(e.getStackTrace());
        }

        public function log(o:Object):void {
            callJs('log', o);
        }
    }
}
