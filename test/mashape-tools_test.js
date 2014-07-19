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
    
    allowedIps = [
        '107.23.255.128',
        '107.23.255.129',
        '107.23.255.130',
        '107.23.255.131',
        '107.23.255.132',
        '107.23.255.133',
        '107.23.255.134',
        '107.23.255.135',
        '107.23.255.136',
        '107.23.255.137',
        '107.23.255.138',
        '107.23.255.139',
        '107.23.255.140',
        '107.23.255.141',
        '107.23.255.142',
        '107.23.255.143',
        '107.23.255.144',
        '107.23.255.145',
        '107.23.255.146',
        '107.23.255.147',
        '107.23.255.148',
        '107.23.255.149',
        '107.23.255.150',
        '107.23.255.151',
        '107.23.255.152',
        '107.23.255.153',
        '107.23.255.154',
        '107.23.255.155',
        '107.23.255.156',
        '107.23.255.157',
        '107.23.255.158',
        '107.23.255.159',
        '54.209.110.14',
        '54.86.14.38',
        '54.86.225.32',
        '54.86.245.80',
        '54.88.28.135',
        '54.88.28.194',
        '54.88.37.172',
        '54.88.51.199',
        '54.88.53.251',
        '54.88.54.104',
        '54.88.55.60',
        '54.88.55.63'
    ];


describe('ipFilter()', function() {
    it('allow valid ip', function(done) {
        var app = express();
        
        app.use(mashape.ipFilter({
            iplist: ['127.0.0.1'],
            strict: false,
            log: false
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
        
        app.use(mashape.ipFilter({
            iplist: ['10.2.2.1'],
            strict: false,
            log: false
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .expect(403, done);
    });
    
    it('allow valid proxy (single ip)', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.ipFilter({
            iplist: allowedIps,
            strict: false,
            log: false
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
            log: false
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
            log: false
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
            log: false
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


describe('headerFilter()', function() {
    it('proxy-secret check valid', function(done) {
        var app = express();
        
        app.use(mashape.headerFilter({
            proxySecret: 'test-secret',
            strict: false,
            log: false
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-mashape-proxy-secret', 'test-secret')
            .expect(200, done);
    });
    
    it('proxy-secret check invalid', function(done) {
        var app = express();
        
        app.use(mashape.headerFilter({
            proxySecret: 'test-secret',
            strict: false,
            log: false
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-mashape-proxy-secret', 'test-secret-invalid')
            .expect(403, done);
    });
    
    it('additional-header check valid', function(done) {
        var app = express();
        
        app.use(mashape.headerFilter({
            strict: false,
            log: false,
            additionalHeaderChecks: [
                { name: 'x-test-header', value: 'exists' }
            ]
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-test-header', 'exists')
            .expect(200, done);
    });
    
    it('additional-header check invalid', function(done) {
        var app = express();
        
        app.use(mashape.headerFilter({
            strict: false,
            log: false,
            additionalHeaderChecks: [
                { name: 'x-test-header', value: 'exists' }
            ]
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-test-header', 'foobar')
            .expect(403, done);
    });
});