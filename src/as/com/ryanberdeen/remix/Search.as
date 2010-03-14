package com.ryanberdeen.remix {
    import com.ryanberdeen.echonest.api.v3.EchoNestError;
    
    import flash.events.Event;

    public class Search {
        private var manager:Manager;
        private var id:String;
        private var params:Object;

        public function Search(manager:Manager, id:String, params:Object):void {
            this.manager = manager;
            this.id = id;
            this.params = params;
        }

        public function load():void {
            manager.alphaApi.searchTracks(params, {
                onResponse: responseHandler,
                onEchoNestError: echoNestErrorHandler,
                onError: errorHandler
            });
        }

        private function responseHandler(response:Object):void {
            setState('complete', response);
        }

        private function echoNestErrorHandler(e:EchoNestError):void {
            setState('echo_nest_error', e);
        }

        private function errorHandler(event:Event):void {
            setState('error', event);
        }

        private function setState(state:String, arg:Object):void {
            manager.callJs('setSearchState', id, state, arg);
        }
    }
}