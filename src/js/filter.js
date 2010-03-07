function FilteredAudioQuantum(audioQuantum, name, options) {
    var that = audioQuantum.clone();
    extend(that, FilteredAudioQuantum.Methods);
    that.filters = that.filters || [];
    that.filter(name, options);
    return that;
}

FilteredAudioQuantum.Methods = {
    filter: function (name, options) {
        this.filters.push({name: name, options: options});
    },

    clone: function () {
        var that = AudioQuantum.prototype.clone.apply(this);
        that.filters = this.filters.slice(0);
        return that;
    }
};

extend(FilteredAudioQuantum, {
    addFilter: function (name) {
        AudioQuantum.prototype[name] = function (options) {
            return this.filtered('touch', options);
        };
    }
});

extend(AudioQuantum.prototype, {
    filtered: function (name, options) {
        return new FilteredAudioQuantum(this, name, options);
    }
});
