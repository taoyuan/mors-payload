/*
 * 
 * https://github.com/taoyuan/mors-payload
 *
 * Copyright (c) 2014 Tao Yuan
 * Licensed under the MIT license.
 */

'use strict';

var iconv = require('iconv-lite');

/**
 * Module exports.
 */

module.exports = perform;

/**
 * Perform a request into a buffer and parse.
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {function} parse
 * @param {object} options
 * @api private
 */

function perform(req, res, next, parse, options) {
    req._parsed = true;

    options = options || {};
    var encoding = options.encoding === null ? null : options.encoding || 'utf-8';
    var verify = options.verify;

    options.encoding = verify ? null : encoding;

    var payload = req.payload;

    // verify
    if (verify) {
        try {
            verify(req, res, payload, encoding);
        } catch (err) {
            if (!err.status) err.status = 403;
            return next(err);
        }
    }

    // parse
    try {
        payload = typeof payload !== 'string' && encoding !== null ? iconv.decode(payload, encoding) : payload;
        req.payload = parse(payload);
    } catch (err) {
        err.payload = payload;
        err.status = 400;
        next(err);
    }

    next();
}