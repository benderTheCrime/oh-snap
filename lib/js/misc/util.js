(function() {
    'use strict';

    var patterns = {
        '&apos;': '\''
    };

    module.exports = {
        spaces: function(y) {
            var space = '',
                i = 0;
            while (++i < y + 1) {
                space += ' ';
            }
            return space;
        },
        hasKey: function(obj, com) {
            if (com && typeof com !== 'string') {

                // Stupid hack
                for (var i = com.length - 1; i >= 0; --i) {
                    if (typeof com[i] === 'string' && com[i] in obj) {
                        return true;
                    }
                }
            } else {
                if (com in obj) {
                    return true;
                }
            }
            return false;
        },
        replacer: function(str) {
            for (var key in patterns) {
                str = str.replace(key, patterns[key]);
            }
            return str;
        }
    };
})();
