'use strict';

var mors = require('mors');
var request = require('morstest');
var t = require('chai').assert;
var payload = require('../');

describe('json', function () {

    it('should parse JSON', function (done) {
        var clireq;
        var server = createServer(function (req) {
            t.isObject(req.payload);
            t.deepEqual(req.payload, {user: 'ty'});
            clireq.close(done);
        });

        clireq = request(server)
            .topic('/')
            .publish('{"user":"ty"}');
    });

    it('should fail gracefully', function (done) {
        var clireq;
        var server = createServer([function (req, res, next) {
            t.fail();
        }, function (err, req, res, next) {
            t.ok(err);
            clireq.close(done);
        }]);

        clireq = request(server)
            .topic('/')
            .publish('{"user"');
    });

    it('should handle empty content payload', function (done) {
        var clireq;
        var server = createServer(function (req) {
            t.isObject(req.payload);
            t.deepEqual(req.payload, {});
            clireq.close(done);
        });

        clireq = request(server)
            .topic('/')
            .publish('');
    });

    it('should 400 on malformed JSON', function (done) {
        var clireq;
        var server = createServer([function (req, res, next) {
            t.fail();
        }, function (err, req, res, next) {
            t.ok(err);
            t.equal(err.status, 400);
            clireq.close(done);
        }]);

        clireq = request(server)
            .topic('/')
            .publish('{"foo');
    });

    describe('when strict is false', function () {
        it('should parse primitives', function (done) {
            var clireq;
            var server = createServer({ strict: false }, function (req, res, next) {
                t.equal(req.payload, true);
                clireq.close(done);
            });

            clireq = request(server)
                .topic('/')
                .publish('true');
        });
    });

    describe('when strict is true', function () {
        it('should not parse primitives', function (done) {
            var clireq;
            var server = createServer({ strict: true }, function (err, req, res, next) {
                t.equal(err.status, 400);
                t.equal(err.message, 'invalid json');
                clireq.close(done);
            });

            clireq = request(server)
                .topic('/')
                .publish('true');
        });

        it('should allow leading whitespaces in JSON', function (done) {
            var clireq;
            var server = createServer({ strict: true }, function (req, res, next) {
                t.deepEqual(req.payload, {"user": "tobi"});
                clireq.close(done);
            });

            clireq = request(server)
                .topic('/')
                .publish('   { "user": "tobi" }');
        });
    });

    describe('by default', function(){
        it('should 400 on primitives', function(done){
            var clireq;
            var server = createServer(function (err, req, res, next) {
                t.equal(err.status, 400);
                clireq.close(done);
            });

            clireq = request(server)
                .topic('/')
                .publish('true');
        });
    });

    describe('with verify option', function(){
        it('should assert value if function', function(){
            var err;

            try {
                var server = createServer({ verify: 'lol' });
            } catch (e) {
                err = e;
            }

            t.ok(err);
            t.equal(err.name, 'TypeError');
        });

        it('should error from verify', function(done){
            var clireq;
            var server = createServer({verify: function(req, res, buf){
                if (buf[0] === '[') throw new Error('no arrays');
            }}, function (err, req, res, next) {
                t.equal(err.status, 403);
                t.equal(err.message, 'no arrays');
                clireq.close(done);
            });

            clireq = request(server)
                .topic('/')
                .publish('["tobi"]');
        });

        it('should allow custom codes', function(done){
            var clireq;
            var server = createServer({verify: function(req, res, buf){
                if (buf[0] !== '[') return;
                var err = new Error('no arrays');
                err.status = 400;
                throw err;
            }}, function (err, req, res, next) {
                t.equal(err.status, 400);
                t.equal(err.message, 'no arrays');
                clireq.close(done);
            });

            clireq = request(server)
                .topic('/')
                .publish('["tobi"]');
        });

        it('should allow pass-through', function(done){
            var clireq;
            var server = createServer({verify: function(req, res, buf){
                if (buf[0] === '[') throw new Error('no arrays');
            }}, function (req, res, next) {
                t.deepEqual(req.payload, {"user":"tobi"});
                clireq.close(done);
            });

            clireq = request(server)
                .topic('/')
                .publish('{"user":"tobi"}');
        });
    });
});

function createServer(opts, fns) {
    if (typeof opts === 'function' || Array.isArray(opts)) {
        fns = opts;
        opts = null;
    }
    opts = opts || {};
    fns = fns || function () {
    };
    if (!Array.isArray(fns)) fns = [fns];

    var json = payload.json(opts);
    var app = mors();
    app.use(json);
    app.use.apply(app, fns);
    return app;
}

