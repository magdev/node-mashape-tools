/**
 * New node file
 */

var request = require('supertest'), 
    express = require('express'),
    mashape = require('../'),
    
    DEBUG = false;


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
