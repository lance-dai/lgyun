#!/usr/bin/env node

var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var cli = new Liftoff({
    name: 'lgyun',
    processTitle: 'lgyun',
    moduleName: 'lgyun',
    configName: 'fis-conf',

    extensions: {
        '.js': null
    }
});

cli.launch({
    cwd: argv.r || argv.root,
    configPath: argv.f || argv.file
},
function(env) {
    var fis;
    if (!env.modulePath) {
        fis = require('../');
    } else {
        fis = require(env.modulePath);
    }
    fis.set('fis.require.paths', path.join(env.cwd, 'node_modules/lgyun'));
    fis.set('fis.require.paths', path.dirname(__dirname));
    fis.cli.run(argv, env);
});
