(function() {
    'use strict';

    var p =         process,
        css =       require('cssbeautify'),
        js =        require('js-beautify'),
        snapArgs =  require('../misc/snapArgs'),
        term =      require('../misc/terminal'),
        h =         require('../misc/htmlUtil'),
        u =         require('../misc/util');

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
                        str += processNode('link', true, tag);

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
                        tag = {
                            type:'text/css',
                            $t: tag
                        };

                        // We've got a style element
                        str += processNode('style', false, tag);
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
        var tag = '<' + name + attrs(obj, ignore) +
            (!self || name === 'meta' || name === 'link' ? '' : ' /') + '>';
        if (obj[node] && typeof obj[node] === 'object') {
            tag += '\n';
            s = s + 4;
            for (i = 0; i < obj[node].length; ++i) {
                tag += processTag(obj[node][i]);
            }
            s = s - 4;
            tag += u.spaces(s);
        }
        tag += content(obj, self, name) + (!self ? '</' + name + '>': '') + '\n';
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
            if ('href' in obj) {
                if ('rel' in obj) {
                    tag.push('a', false);
                } else {
                    tag.push('link', true);
                }
            } else if ('src' in obj) {
                if ('type' in obj) {
                    tag.push('script', false);
                } else {

                    // Don't match against tiff because they don't load
                    if (/\.(gif|jpg|jpeg|png)$/i.test(obj.src)) {
                        tag.push('img', true);
                    } else {
                        tag.push('iframe', false);
                    }
                }
            } else if ('method' in obj || 'action' in obj) {
                tag.push('form', false);
            } else if ('type' in obj) {
                tag.push('input', true);
            } else if ('for' in obj) {
                tag.push('label', false);
            } else if ('rel' in obj) {
                if (~obj.rel.indexOf('stylesheet')) {
                    tag.push('link', true);
                } else {
                    tag.push('style', false);
                }
            } else if (obj[node]) {

                // TODO special parsers for each of these: ul/ol/select/table
                // selects all have value, no children children, ul will have single children without value, table has multiple children, check for params
            } else {
                tag.push('div', false);
            }
        } else {

            // Because we really don't care about p, b, i
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
        var str= '';
        // TODO check tag text attr
        if (typeof obj === 'object') {
            for (var key in obj) {
                if (key !== '$t' && key !== node && !~ignored.indexOf(key)) {
                    str += ' ' + key;
                    if (!/disabled|checked|seamless/g.test(key)) {
                        str += '="' + obj[key].toString() + '"';
                    }
                }
            }
        }
        return str;
    }

    function content(obj, self, tag) {
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

        str = u.replacer(str);

        if (snapArgs.get('expand')) {
            if (tag === 'style') {
                str = css(str, {
                    autosemicolon: true
                });
            } else if (tag === 'script') {
                str = js(str);
            }
            str = str.replace(/\n/g, '\n' + u.spaces(s + 4));
        }

        return '\n' + u.spaces(s + 4) + str + '\n' + u.spaces(s);
    }

    module.exports = {
        read: function(obj) {

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
            return snapArgs.get('minify') ? h.trimWhitespace(str) : str;
        }
    };
})();
