(function() {
    'use strict';

    var xml = require('xml2json');

    var str,
        tag;

    module.exports = {
        clean: function(html) {
            str = html;
            tag = str.match(/<.*\s/g)[0].replace(/<|\s+.*/g, '');
            this.replaceAttrs()
                .replaceComments()
                .trimWhitespace()
                .replaceSingletons();
            return str;
        },
        trimWhitespace: function() {
            str = str.replace(/\s{2,}|[\r\n]/g,' ').replace(/>\s</g,'><');
            return this;
        },
        replaceAttrs: function() {
            str = str.replace(/disabled|checked|seamless/g, function(match) {
                return match + '="true"';
            });
            return this;
        },
        replaceSingletons: function() {
            str = str.replace(/\/(|\s+)>/g, '></' + tag + '>');
            return this;
        },
        replaceComments: function() {
            str = str.replace(/<\!--/g, '<' + tag + ' comment="true">')
                .replace(/-->/g, '</' + tag + '>');
            return this;
        },
        toJSON: function(str) {
            return xml.toJson(str, { object: true });
        }
    };
})();

// TODO you need the tag name here
