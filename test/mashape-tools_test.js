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
    
    MASHAPE_KEY = process.env.MASHAPE_KEY,
    
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
            iplist: ['127.0.0.1'],
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




/**
 * Test headerFilter()
 */
describe('headerFilter()', function() {
    it('proxy-secret check valid', function(done) {
        var app = express();
        
        app.use(mashape.headerFilter({
            proxySecret: 'test-secret',
            strict: false,
            log: false,
            debug: DEBUG
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
            log: false,
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-mashape-proxy-secret', 'test-secret-invalid')
            .expect(403, done);
    });
    
    it('proxy-secret check invalid, but ip whitelisted', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.headerFilter({
            proxySecret: 'test-secret',
            strict: false,
            log: false,
            whitelist: ['10.2.2.2'],
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-mashape-proxy-secret', 'foobar')
            .set('x-forwarded-for', '10.2.2.2')
            .expect(200, done);
    });
    
    it('additional-header check valid', function(done) {
        var app = express();
        
        app.use(mashape.headerFilter({
            strict: false,
            log: false,
            additionalHeaderChecks: [
                { name: 'x-test-header', value: 'exists' }
            ],
            debug: DEBUG
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
            ],
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-test-header', 'foobar')
            .expect(403, done);
    });
    
    it('additional-header check invalid, but ip whitelisted', function(done) {
        var app = express();
        app.set('trust proxy', true);
        
        app.use(mashape.headerFilter({
            proxySecret: 'test-secret',
            strict: false,
            log: false,
            whitelist: ['10.2.2.2'],
            additionalHeaderChecks: [
                { name: 'x-test-header', value: 'exists' }
            ],
            debug: DEBUG
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-test-header', 'foobar')
            .set('x-forwarded-for', '10.2.2.2')
            .expect(200, done);
    });
    
});



if (MASHAPE_KEY) {
    /**
     * Test ServiceContainer
     */
    describe('ServiceContainer()', function() {
        it('load (autodiscovery off)', function(done) {
            var app = express();
            
            app.use(mashape.serviceContainer({
                strict: false,
                log: false,
                debug: DEBUG,
                mashapeKey: MASHAPE_KEY
            }));
            
            app.get('/', function(req, res) {
                if (req.service) {
                    return res.send(200);
                }
                return res.send(404);
            });
            
            request(app)
                .get('/')
                .expect(200, done);
        });
        
        
        it('manual register and call magdev/GermanBanks (autodiscovery off)', function(done) {
            var app = express();
            
            app.use(mashape.serviceContainer({
                strict: false,
                log: false,
                debug: DEBUG,
                mashapeKey: MASHAPE_KEY
            }));
            
            app.use(function(req, res, next) {
                req.service.register('germanbanks', {
                    url: {
                        protocol: 'https:',
                        hostname: 'german-banks.p.mashape.com'
                    }
                });
                return next();
            });
            
            app.get('/', function(req, res) {
                if (!req.service) {
                    return res.send(500);
                }
                req.service.call('germanbanks', 'get', '/', {}, function(result) {
                    if (!result || result.code === 404) {
                        return res.send(404);
                    }
                    return res.send(result.code);
                });
            });
            
            request(app)
                .get('/')
                .expect(200, done);
        });
        
        it('load (autodiscovery on)', function(done) {
            var app = express();
            
            app.use(mashape.serviceContainer({
                strict: false,
                log: false,
                debug: DEBUG,
                mashapeKey: MASHAPE_KEY,
                autodiscovery: true
            }));
            
            app.get('/', function(req, res) {
                if (!req.service) {
                    return res.send(500);
                }
                
                req.service.info('mashape', function(e, info) {
                    if (e) {
                        return res.send(500);
                    }
                    if (!info) {
                        return res.send(404);
                    }
                    return res.send(200);
                });
            });
            
            request(app)
                .get('/')
                .expect(200, done);
        });
        
        it('call mashape:/users/mashaper/apis/mashape (autodiscovery on)', function(done) {
            var app = express();
            
            app.use(mashape.serviceContainer({
                strict: false,
                log: false,
                debug: DEBUG,
                mashapeKey: MASHAPE_KEY,
                autodiscovery: true
            }));
            
            app.get('/', function(req, res) {
                if (!req.service) {
                    return res.send(500);
                }
                
                req.service.call('mashape', 'get', '/users/mashaper/apis/mashape', {}, function(result) {
                    if (!result || result.code === 404) {
                        return res.send(404);
                    }
                    return res.send(result.code);
                });
            });
            
            request(app)
                .get('/')
                .expect(200, done);
        });
        
        
        it('discover and call magdev/GermanBanks (autodiscovery on)', function(done) {
            var app = express();
            
            app.use(mashape.serviceContainer({
                strict: false,
                log: false,
                debug: DEBUG,
                mashapeKey: MASHAPE_KEY,
                autodiscovery: true
            }));
            
            app.use(function(req, res, next) {
                req.service.discover('magdev/GermanBanks', function(e, container) {
                    if (DEBUG) {
                        console.log(container.services);
                    }
                    return next();
                });
            });
            
            app.get('/', function(req, res) {
                if (!req.service) {
                    return res.send(500);
                }
                req.service.call('germanbanks', 'get', '/', {}, function(result) {
                    if (!result || result.code === 404) {
                        return res.send(404);
                    }
                    if (DEBUG) {
                        console.log(result.body);
                    }
                    return res.send(result.code);
                });
            });
            
            request(app)
                .get('/')
                .expect(200, done);
        });
    });
}