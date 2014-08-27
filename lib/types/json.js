/*!
 * payload-parser
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var perform = require('../perform');

/**
 * Module exports.
 */

module.exports = json;

/**
 * RegExp to match the first non-space in a string.
 */

var firstcharRegExp = /^\s*(.)/;

/**
 * Create a middleware to parse JSON bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @api public
 */

function json(options) {
    options = options || {};

    var reviver = options.reviver;
    var strict = options.strict !== false;
    var verify = options.verify || false;

    if (verify !== false && typeof verify !== 'function') {
        throw new TypeError('option verify must be function');
    }

    function parse(payload) {
        if (0 === payload.length) {
            throw new Error('invalid json, empty payload');
        }

        if (strict) {
            var first = firstchar(payload);

            if (first !== '{' && first !== '[') {
                throw new Error('invalid json');
            }
        }

        return JSON.parse(payload, reviver);
    }

    return function json(req, res, next) {
        if (req._parsed) return next();
        req.payload = req.payload || {};

        if (typeof req.payload !== 'string') return next();

        // perform
        perform(req, res, next, parse, {
            encoding: 'utf-8',
            verify: verify
        });
    };
}

/**
 * Get the first non-whitespace character in a string.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */


function firstchar(str) {
    if (!str) return '';
    var match = firstcharRegExp.exec(str);
    return match ? match[1] : '';
}
