(function() {
    'use strict';

    var p =     process,
        args =  p.argv,
        term =  require('../misc/terminal'),
        h =    require('../misc/htmlUtil'),
        u =     require('../misc/util');

    var str,
        s = 0,
        i,
        node;

    // Can only include tags like meta, title, link, script, style, comments (TODO)
    function head(obj) {
        var str;

        // None of the properties in head have children...fortunately... [> -_-]> le sigh...body...
        if (obj.hasOwnProperty(node)) {
            s = 4;
            str = u.spaces(s) + '<head' + attrs(obj) + '>\n';
            s = 8;
            str += u.spaces(s) + '<meta charset="utf-8">\n';
            for (i = 0; i < obj[node].length; ++i) {
                var tag = obj[node][i];
                str += u.spaces(s);
                if (typeof tag !== 'string') {
                    if (u.hasKey(tag, [ 'content', 'name', 'charset', 'http-equiv' ])) {

                        // We've got a meta tag!!
                        if ('charset' in tag && /utf(|-)8/i.test(tag.charset)) {
                            continue;
                        }
                        str += processNode('meta', true, tag, [ 'charset' ]);
                    } else if ('href' in tag) {
                        if (!tag.rel) {
                            tag.rel = 'stylesheet';
                        }

                        // We've got a link object
                        str += processNode('script', true, tag);

                    } else if ('src' in tag || ('type' in tag && tag.type === 'text/javascript')) {
                        if (!tag.type) {
                            tag.type = 'text/javascript';
                        }

                        // We've got a script
                        str += processNode('script', false, tag);
                    } else if ('comment' in tag) {
                        str += addComment(tag);
                    }
                } else {
                    if (/[a-z]+(|\s+)\{.*\}/.test(tag)) {
                        if (!tag.type) {
                            tag.type = 'text/css';
                        }

                        // We've got a style element
                        str += processNode('style', false, tag, [ 'type' ]);
                    } else {

                        // We've got a title
                        str += processNode('title', false, tag);
                    }
                }
            }
            s = 4;
            str += u.spaces(s) + '</head>\n';
        }
        return str;
    }

    function processNode(name, self, obj, ignore) {
        var tag = '<' + name + attrs(obj, ignore) + (self ? '/' : '') + '>';
        if (obj[node] && typeof obj[node] === 'object') {
            tag += '\n';
            s = s + 4;
            for (i = 0; i < obj[node].length; ++i) {
                tag += processTag(obj[node][i]);
            }
            s = s - 4;
            tag += u.spaces(s);
        }
        tag += content(obj, self) + (!self ? '</' + name + '>': '') + '\n';
        return tag;
    }


    // Resolve differences in body parsing, non body parsing and normal parsing
    function processTag(obj, body) {
        var str;
        if (body) {
            s = 4;
        }

        // Everything inside the body tag except the tag itself should be exported
        if (obj) {
            if (obj.comment) {
                str = addComment(obj);
            } else {
                var tag = body ? ['body', false ] : tagType(obj);
                str = u.spaces(s) + processNode(tag[0], tag[1], obj);
            }
        }
        return str;
    }

    function tagType(obj) {
        var tag = [];
        if (typeof obj === 'object') {
            if (obj.href) {
                if (!obj.rel) {
                    tag.push('a', false);
                } else {
                    tag.push('link', true);
                }
            } else if (obj.src) {
                if (!obj.type) {
                    tag.push('img', true);
                } else {
                    tag.push('script', false);
                }
            } else if (obj.type) {
                tag.push(obj.type, true);
            } else if (obj['for']) {
                tag.push('label', false);
            } else if (obj[node]) {

                // TODO special parsers for each of these: ul/ol/select/table
            } else {
                tag.push('div', false);
            }
        } else {

            tag.push('span', false);
        }

        // TODO textarea, p, b, i
        return tag;
    }

    function addComment(obj) {
        return '<!-- ' + content(obj).trim() + ' -->\n';
    }

    function attrs(obj, ignored) {
        ignored = ignored || [];
        var attrStr= '';
        // TODO check tag text attr
        if (typeof obj === 'object') {
            for (var key in obj) {
                if (key !== '$t' && key !== node && !~ignored.indexOf(key)) {
                    attrStr += ' ' + key;
                    if (!/disabled|checked|seamless/g.test(key)) {
                        attrStr += '="' + obj[key].toString() + '"';
                    }
                }
            }
        }
        return attrStr;
    }

    function content(obj, self) {
        if (self) {
            return '';
        }

        var str;
        if (typeof obj === 'string' && obj.length > 0) {
            str = obj;
        } else if (obj.$t) {
            str = obj.$t;
        } else {
            return '';
        }

        return '\n' + u.spaces(s + 4) + u.replacer(str) + '\n' + u.spaces(s);
    }

    module.exports = {
        read: function(snapArgs, tags, obj) {
            for (var key in obj) {
                node = key;
            }

            if (u.hasKey(obj, [ 'ember', 'handlebars', 'template' ])) {

                // We are building a template of some sort and do not need html structure standard
                str += processTag(obj);
            } else {
                str = '<!DOCTYPE html>\n<html' + attrs(obj[node]) + '>\n';
                if (obj[node][node].length === 2) {

                    // We have a head and a body in our structure
                    str += head(obj[node][node][0]);
                    str += processTag(obj[node][node][1], true);
                } else {

                    // Something is very wrong
                    term.err('Tags should not live outside of the head or body');
                    p.exit(1);
                }
                str += '</html>';
            }
            return /-[-]m($|inify)/i.test(args) ? h.trimWhitespace(str) : str;
        }
    };
})();
