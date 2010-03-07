package com.ryanberdeen.remix.filter {
    import com.ryanberdeen.audio.ISampleSource;

    public interface IFilterFactory {
        function createFilter(source:ISampleSource, options:Object):ISampleSource;
    }
}
