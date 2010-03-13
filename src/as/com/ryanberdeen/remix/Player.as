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
        }

        public function preparePlayer(sourceList:SourceList):void {
            this.sourceList = sourceList;
            resetPlayer();

            remixPlayer = new SampleSourcePlayer();
            remixPlayer.addEventListener(Event.SOUND_COMPLETE, playerSoundCompleteHandler);

            remixPlayer.sampleSource = sourceList;
            enablePlayer();
        }

        private function positionUpdateTimerHandler(e:Event):void {
            var position:Number = remixPlayer.position;
            var source:Object = sourceList.getSource(position);
            manager.callJs('setProgress',  position / sourceList.length, source.index, source.position);
        }

        private function enablePlayer():void {
            // TODO
        }

        private function resetPlayer():void {
            if (remixPlayer != null) {
                remixPlayer.stop();

                remixPlayer = null;
            }
            playing = false;
            manager.callJs('setProgress', 0, 0);
            positionUpdateTimer.stop();
        }

        private function playerSoundCompleteHandler(e:Event):void {
            positionUpdateTimer.stop();
            // FIXME
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
            // TODO
        }

        private function pause():void {
            remixPlayer.stop();
            playing = false;
            positionUpdateTimer.stop();
            // TODO
        }
    }
}
