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

        public function preparePlayer(sourceList:SourceList):void {
            this.sourceList = sourceList;
            resetPlayer();

            remixPlayer = new SampleSourcePlayer();
            remixPlayer.addEventListener(Event.SOUND_COMPLETE, playerSoundCompleteHandler);

            remixPlayer.sampleSource = sourceList;
            setState('ready');
        }

        private function positionUpdateTimerHandler(e:Event):void {
            var position:Number = remixPlayer.position;
            var source:Object = sourceList.getSource(position);
            manager.callJs('setProgress',  position / sourceList.length, source.index, source.position);
        }

        private function resetPlayer():void {
            if (remixPlayer != null) {
                remixPlayer.stop();

                remixPlayer = null;
            }
            playing = false;
            positionUpdateTimer.stop();
            setState('empty');
        }

        private function playerSoundCompleteHandler(e:Event):void {
            positionUpdateTimer.stop();
            setState('complete');
            setState('paused');
            //preparePlayer();
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
