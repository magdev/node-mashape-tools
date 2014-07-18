/**
 * New node file
 */
var request = require('supertest'), 
    express = require('express'),
    mashape = require('../');

// Enable Proxy-Secret-Filter
/*app.use(mashape.headerFilter({
    proxySecret: 'test-secret',
    additionalHeaderChecks: [
        { name: 'x-test-header', value: 'exists' }
    ]
}));*/

describe('ipFilter()', function() {
    it('allows valid ip', function(done) {
        var app = express();
        
        app.use(mashape.ipFilter({
            iplist: ['127.0.0.1'],
            strict: false
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-mashape-user', 'test')
            .expect(200, done);
    });
    
    it('denies invalid ip', function(done) {
        var app = express();
        
        app.use(mashape.ipFilter({
            iplist: ['10.2.2.1'],
            strict: false
        }));
        
        app.get('/', function(req, res){
            res.send(200);
        });
        
        request(app)
            .get('/')
            .set('x-mashape-user', 'test')
            .expect(403, done);
    });
});