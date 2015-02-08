/**
 * mashape-tools
 * https://github.com/magdev/node-mashape-tools
 *
 * Copyright (c) 2014 Marco Grätsch
 * Licensed under the MIT license.
 */

'use strict';

var request = require('supertest'), 
    express = require('express'),
    mashape = require('../'),
    
    DEBUG = false,
    
    allowedIps = [
        '107.23.255.128'
    ];


/**
 * Test ipFilter()
 */
describe('ipFilter()', function() {
    it('allow valid ip', function(done) {
        var app = express();
        
        app.use(mashape.ipFilter({
            iplist: ['127.0.0.1', '::ffff:127.0.0.1'],
            strict: false,
            log: false,
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .expect(200, done);
    });
    
    it('deny invalid ip', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.ipFilter({
            iplist: ['10.2.2.2'],
            strict: false,
            log: false,
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-forwarded-for', '10.2.2.1')
            .expect(403, done);
    });
    
    
    it('allow whitelisted ip', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.ipFilter({
            iplist: allowedIps,
            strict: false,
            log: false,
            debug: DEBUG,
            whitelist: ['10.2.2.1']
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-forwarded-for', '10.2.2.1')
            .expect(200, done);
    });
    
    it('deny non-whitelisted ip', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.ipFilter({
            iplist: allowedIps,
            strict: false,
            log: false,
            debug: DEBUG,
            whitelist: ['10.2.2.1']
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-forwarded-for', '10.2.2.2')
            .expect(403, done);
    });
    
    it('allow valid proxy (single ip)', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.ipFilter({
            iplist: allowedIps,
            strict: false,
            log: false,
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-forwarded-for', '107.23.255.128')
            .expect(200, done);
    });
    
    it('deny invalid proxy (single ip)', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.ipFilter({
            iplist: allowedIps,
            strict: false,
            log: false,
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-forwarded-for', '10.2.2.20')
            .expect(403, done);
    });
    
    it('allow valid proxy (multiple ips)', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.ipFilter({
            iplist: allowedIps,
            strict: false,
            log: false,
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-forwarded-for', '10.2.2.20,107.23.255.128')
            .expect(200, done);
    });
    
    it('deny invalid proxy (multiple ips)', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.ipFilter({
            iplist: allowedIps,
            strict: false,
            log: false,
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-forwarded-for', '10.2.2.20,10.2.2.22')
            .expect(403, done);
    });
});




