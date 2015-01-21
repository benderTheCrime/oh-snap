(function() {
    'use strict';

    var args = {};

    module.exports = {
        set: function(key, val) {
            args[key] = val;
        },
        get: function(key) {
            return !!args[key];
        }
    };
})();
