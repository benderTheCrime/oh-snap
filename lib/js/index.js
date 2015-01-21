(function() {
    'use strict';

    var p =         process,
        args =      p.argv,
        fs =        require('fs'),
        snapArgs=   require('./misc/snapArgs'),
        term =      require('./misc/terminal'),
        u =         require('./misc/htmlUtil');

    var cwd = p.cwd(),
        content,
        src = [],
        dest,
        i;

    module.exports = function() {
        dest = args[ args.length - 1 ];

        if (fs.existsSync(dest)) {
            args.splice(args.length - 1);
        } else {
            term.err('Destination does not exist\n');
            p.exit(1);
        }

        for (i = args.length - 1; i > 0; --i) {
            if (/.snap/.test(args[ i ])) {
                try {
                    content = u.clean(
                        fs.readFileSync(cwd + '/' + args[ i ], 'utf8')
                    );
                } catch (err) {
                    term.err(err);
                    continue;
                }
                src.push({
                    filename: args[ i ].split('/').pop(),
                    content: content
                });
            } else {
                term.err('File ' + args[ i ] + ' is not of filetype \'.snap\'\n');
            }
        }

        if (!src.length) {
            term.err('No source files found\n');
            p.exit(1);
        }

        for (i = src.length - 1; i >= 0; --i) {
            try {
                content = u.toJSON(src[ i ].content);
            } catch (err) {
               term.err(err + '\n');
               p.exit(1);
            }

            var output = require('./modules/tags').read(content);
            fs.writeFileSync(
                cwd + '/' + dest + '/' + src[ i ].filename.replace('.snap', '.html'),
                output
            );

            if (snapArgs.get('open')) {
                // open cwd + '/' + dest + '/' + src[ i ].filename.replace('.snap', '.html')
            }
        }
    };
})();
