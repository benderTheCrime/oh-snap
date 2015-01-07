(function() {
    'use strict';

    var fs =            require('fs'),
        handlebars =    require('handlebars'),
        xml =           require('xml2json'),
        open =          require('open');

    var VERSION = '0.0.1',
        INTERPRETTER_TAGS = {
            all: {},
            text: {},
            hyperlink: {},
            container: {},
            table: {}
        },
        cwd = process.cwd(),
        makeFiles = [],
        i;

    if (!!~process.argv.indexOf('--help')) {
        // TODO show help menu
        console.log('HAI!!! I\'m a help menu.\nI\'ll help you with all ' +
                    'of your snap needs');
        return;
    }

    if (!!~process.argv.indexOf('node')) {
        process.argv.splice(process.argv.indexOf('node'), 1);
    }

    // TODO process all '-' options, remove from process.argv
    // TODO add option to compile as Handlebars -bs
    // TODO Check -o option, check for *, fs supports wildcards

    // Resolve files passed in
    for (i = 1; i < process.argv.length; ++i) {
        var file = process.argv[i];
        if (!!~file.split('/').pop().indexOf('snap')) {
            makeFiles.push(file);
        }
    }

    for (i = makeFiles.length - 1; i >= 0; --i) {
        fs.readFile(makeFiles[i], 'utf8', function(err, content) {
            if (!err) {
                content = trimDoctype(content);

                console.log(content);

                content = trimWhitespace(content);

                console.log(content);

                content = xml.toJson(content);
                content = JSON.parse(content);

                // TODO, until you trim doctype, start one tag in
                content = content.tag;

                // Set top level rules
                if (content.tag) {
                    content.tag.isOutermost = true;
                    content.tag[0].isHead = true;
                    content.tag[1].isBody = true;
                }
                console.log(content);

            } else {
                throw new Error('Error reading file (' + file + '): ' + err);
            }
        });
    }

    function handleTags() {

        //head should have no nested tags
        //(if )

        // We need to set up a list of rules here to be used for the parsing
        // href, in head = link, in body = a
        // not src and not href, meta tag
        // src in body without type is img
        // type makes input
        // element with children with at most single child, list
        // select is list with children with values
        // element with children with many children, table
        // for is label
        // blah



    }

    function trimWhitespace(c) {
        return c.replace(/\s{2,}|[\r\n]/g,' ').replace(/>\s</g,'><');
    }

    function trimDoctype(d) {
        return d.replace(/<\![D|d][O|o][C|c][T|t][Y|y][P|p][E|e] .*.>/i, '');
    }

    // TODO log an error if there is no file in files
    // TODO add min error

})();
