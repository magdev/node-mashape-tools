/**
 * New node file
 */
var request = require('supertest'), 
    express = require('express'),
    mashape = require('../');


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