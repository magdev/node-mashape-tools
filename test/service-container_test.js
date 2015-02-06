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
        it('load', function(done) {
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
        
        
        it('manual register and call magdev/GermanBanks', function(done) {
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
        
        // Skipping due to Mashape API-Errors
        /*it('call mashape:/users/mashaper/apis/mashape', function(done) {
            var app = express();
            
            app.use(mashape.serviceContainer({
                strict: false,
                log: false,
                debug: DEBUG,
                mashapeKey: MASHAPE_KEY
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
        });*/
    });
}