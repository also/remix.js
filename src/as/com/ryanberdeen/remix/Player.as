package com.ryanberdeen.remix {
    import com.ryanberdeen.audio.SourceList;
    import com.ryanberdeen.audio.SampleSourcePlayer;

    import flash.events.Event;
    import flash.utils.Timer;

    public class Player {
        private var manager:Manager;
        private var remixPlayer:SampleSourcePlayer;
        private var playing:Boolean;
        private var positionUpdateTimer:Timer;
        private var sourceList:SourceList;

        public function Player(manager:Manager) {
            this.manager = manager;
            positionUpdateTimer = new Timer(10);
            positionUpdateTimer.addEventListener('timer', positionUpdateTimerHandler);
            setState('empty');
        }

        public function prepare(sourceList:SourceList):void {
            this.sourceList = sourceList;
            reset();

            remixPlayer = new SampleSourcePlayer();
            remixPlayer.addEventListener(Event.SOUND_COMPLETE, soundCompleteHandler);

            remixPlayer.sampleSource = sourceList;
            setState('ready');
        }

        private function positionUpdateTimerHandler(e:Event):void {
            var position:Number = remixPlayer.position;
            var source:Object = sourceList.getSource(position);
            manager.callJs('setProgress',  position / sourceList.length, source.index, source.position);
        }

        public function reset():void {
            if (remixPlayer != null) {
                if (playing) {
                    pause();
                }

                remixPlayer = null;
            }
            setState('empty');
        }

        private function soundCompleteHandler(e:Event):void {
            pause();
            setState('complete');
        }

        public function togglePlayPause():void {
            if (!playing) {
                play();
            }
            else {
                pause();
            }
        }

        public function play():void {
            remixPlayer.start();
            playing = true;
            positionUpdateTimer.start();
            setState('playing');
        }

        private function pause():void {
            remixPlayer.stop();
            playing = false;
            positionUpdateTimer.stop();
            setState('paused');
        }

        private function setState(state:String):void {
            manager.callJs('setPlayerState', state);
        }
    }
}
