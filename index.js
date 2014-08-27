"use strict";

var fs = require('fs');
var path = require('path');

/**
 * Path to the parser modules.
 */

var parsersDir = path.join(__dirname, 'lib', 'types');

/**
 * Auto-load bundled parsers with getters.
 */

fs.readdirSync(parsersDir).forEach(function onfilename(filename) {
    if (!/\.js$/.test(filename)) return;

    var loc = path.resolve(parsersDir, filename);
    var mod;
    var name = path.basename(filename, '.js');

    function load() {
        if (mod) {
            return mod;
        }

        return mod = require(loc);
    }

    Object.defineProperty(exports, name, {
        configurable: true,
        enumerable: true,
        get: load
    });
});