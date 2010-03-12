package com.ryanberdeen.remix {
    import flash.events.Event;
    import flash.events.IOErrorEvent;
    import flash.events.SecurityErrorEvent;
    import flash.media.Sound;
    import flash.net.FileFilter;
    import flash.net.FileReference;
    
    import com.ryanberdeen.echonest.api.v3.EchoNestError;
    import com.ryanberdeen.echonest.api.v3.EchoNestErrorEvent;
    import com.ryanberdeen.echonest.api.v3.track.AnalysisEvent;
    import com.ryanberdeen.echonest.api.v3.track.AnalysisLoader;
    import com.ryanberdeen.utils.MD5Calculator;

    import org.audiofx.mp3.MP3FileReferenceLoader;
    import org.audiofx.mp3.MP3SoundEvent;

    public class Track {
        private var manager:Manager;
        private var id:String;
        private var md5:String;
        private var trackId:String;
        private var _sound:Sound;

        private var fileReference:FileReference;
        private var mp3Loader:MP3FileReferenceLoader;
        private var md5Calculator:MD5Calculator;
        private var analysisLoader:AnalysisLoader;
        
        public function Track(manager:Manager, id:String) {
            this.manager = manager;
            this.id = id;
        }
        
        public function get sound():Sound {
            return _sound;
        }
        
        public function loadFile():void {
            fileReference = new FileReference();
            fileReference.addEventListener(Event.SELECT, fileReferenceSelectHandler);
            fileReference.browse([new FileFilter("MP3 Files", "*.mp3")]);
        }
        
        private function fileReferenceSelectHandler(e:Event):void {
            setState('sound_loading', {modificationDate: fileReference.modificationDate, name: fileReference.name, size: fileReference.size});
            mp3Loader = new MP3FileReferenceLoader();
            mp3Loader.addEventListener(Event.COMPLETE, soundLoadCompleteHandler);
            mp3Loader.getSound(fileReference);
        }

        private function soundLoadCompleteHandler(e:MP3SoundEvent):void {
            // TODO send track info (length etc.)
            setState('sound_loaded', null);
            _sound = e.sound;
            mp3Loader.removeEventListener(Event.COMPLETE, soundLoadCompleteHandler);
            mp3Loader = null;

            md5Calculator = new MD5Calculator();
            md5Calculator.addEventListener(Event.COMPLETE, md5CompleteHandler);
            md5Calculator.calculate(fileReference.data);
        }
        
        private function md5CompleteHandler(e:Event):void {
            md5 = md5Calculator.md5;
            md5Calculator = null;
            
            setState('md5_calculated', md5);
        }

        /** load the analysis, and if it isn't available, upload */
        public function loadAnalysis():void {
            setState('check_analysis', null);
            analysisLoader = createAnalysisLoader();
            analysisLoader.addEventListener(AnalysisEvent.UPLOAD_REQUIRED, uploadRequiredHandler);
            analysisLoader.load({md5: md5});
        }

        private function createAnalysisLoader():AnalysisLoader {
            analysisLoader = new AnalysisLoader(manager.trackApi);
            analysisLoader.addEventListener(AnalysisEvent.ERROR, analysisErrorHandler);
            analysisLoader.addEventListener(AnalysisEvent.COMPLETE, analysisCompleteHandler);
            analysisLoader.addEventListener(Event.COMPLETE, analysisLoaderCompleteHandler);
            analysisLoader.addEventListener(EchoNestErrorEvent.ECHO_NEST_ERROR, echoNestErrorEventHandler);
            analysisLoader.addEventListener(IOErrorEvent.IO_ERROR, errorEventHandler);
            analysisLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, errorEventHandler);
            return analysisLoader;
        }

        private function uploadRequiredHandler(e:Event):void {
            uploadFile();
        }
        
        private function uploadFile():void {
            setState('sound_uploading', null);
            manager.trackApi.uploadFileReference({file: fileReference, wait: "N"}, {
                onResponse: function(track:Object):void {
                    trackId = track.id;
                    loadAnalysisAfterUpload();
                },
                onEchoNestError: function(error:EchoNestError):void {
                    // FIXME set state
                },
                onError: function(error:Event) {
                    // FIXME setState
                }
            });
        }
        
        private function loadAnalysisAfterUpload():void {
            analysisLoader = createAnalysisLoader();
            analysisLoader.uploaded = true;
            analysisLoader.addEventListener(AnalysisEvent.UPLOAD_REQUIRED, uploadRequiredHandler);
            analysisLoader.load({id: trackId});
        }
        
        private function analysisErrorHandler(e:Event):void {
            // FIXME set state
        }

        private function analysisCompleteHandler(e:Event):void {
            setState('analysis_loading', null);
        }

        private function analysisLoaderCompleteHandler(e:Event):void {
            setState('analysis_loaded', analysisLoader.analysis);
        }

        private function echoNestErrorEventHandler(error:EchoNestErrorEvent):void {
            // TODO
        }

        private function errorEventHandler(e:Event):void {
            // TODO
        }

        private function errorHandler(e:Error):void {
            // TODO
        }

        private function setState(state:String, arg:Object):void {
            manager.setTrackState(id, state, arg);
        }
    }
}
