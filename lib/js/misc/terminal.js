(function() {
    'use strict';

    var chalk = require('chalk');

    var prefix = chalk.bold('SNAP: ');

    module.exports = {
        out: function(string, color, flag) {
            process.stdout.write((flag === false ? '' : prefix) + chalk[ color || 'white' ](string));
            return this;
        },
        err: function(string) {
            this.out(string, 'red');
            return this;
        },
        help: function(v) {
            this.out('The single tag template compiler\n', 'bold')
                .out('version: ' + v + '\n\n', 'white', false)
                .out('Usage:\n', 'bold', false)
                .out('    snap [ input files ] [ output directory ] [ options ]\n\n', 'white', false)
                .out('Options:\n', 'bold', false)
                .out('    --help, --h    Display this help text\n', 'white', false)
                .out('    --debug, --d   Run debugger processes, display debug information\n', 'white', false)
                .out('    --ember, --e   Compile as ember template(s)\n', 'white', false)
                .out('    --handlebars   Compile as handlebars template(s)\n', 'white', false)
                .out('    --template     Compile as generic template(s)\n', 'white', false)
                .out('    --open, --o    Opens output in a browser\n\n', 'white', false);
            return this;
        }
    };
})();
