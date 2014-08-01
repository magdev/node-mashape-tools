/**
 * New node file
 */
var request = require('supertest'), 
    express = require('express'),
    mashape = require('../'),
    
    DEBUG = false,
    
    MASHAPE_KEY = process.env.MASHAPE_KEY;


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