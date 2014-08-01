/**
 * New node file
 */

var unirest = require('unirest'),
    extend = require('xtend'),
    url = require('url');

/**
 * Service Container
 * 
 * @param {Object} config
 */
var ServiceContainer = function(config) {
    this.config = config;
    this.services = {};
    
    if (this.config.autodiscovery) {
        this.register('mashape', {
            url: {
                protocol: 'https:',
                hostname: 'mashape.p.mashape.com'
            }
        }, function(e, container) {
            if (container.config.debug) {
                if (e) {
                    console.log(e);
                }
                console.log(container);
            }
        });
    }
};



/**
 * Service Container Prototype
 */
ServiceContainer.prototype = {
    
    /**
     * Register a service
     * 
     * @param {String} name
     * @param {Object} options
     * @param {Function} cb
     * @returns {ServiceContainer}
     */
    register: function(name, options, cb) {
        this.services[name] = options;
        return cb ? cb(null, this) : this;
    },
    
    
    /**
     * Remove a service
     * 
     * @param {String} name
     * @param {Function} cb
     * @returns {ServiceContainer}
     */
    remove: function(name, cb) {
        if (this.services[name]) {
            delete this.services[name];
        }
        return cb ? cb(null, this) : this;
    },
    
    
    /**
     * Get service information
     * 
     * @param {String} name
     * @param {Function} cb
     * @returns {Object}
     */
    info: function(name, cb) {
        if (this.services[name]) {
            return cb ? cb(null, this.services[name]) : this.services[name];
        }
        var e = new Error('Unknown service: %s', name);
        if (cb) {
            return cb(e, null);
        }
        throw e;
    },
    
    
    /**
     * Make an API call
     * 
     * @param {String} name
     * @param {String} method
     * @param {String} path
     * @param {Object} parameters
     * @param {Function} cb
     */
    call: function(name, method, path, parameters, cb) {
        var service = this.info(name),
            serviceUrl = url.format(extend(service.url, {
                pathname: path,
                query: parameters
            }));
        
        this.unirest(method, serviceUrl).end(cb);
    },
    
    
    /**
     * Get HTTP-Headers
     * 
     * @returns {Object}
     */
    headers: function() {
        var hdrs = {
                'X-Mashape-Key': this.config.mashapeKey
            };
        return hdrs;
    },
    
    
    /**
     * Get a unirest instance
     * 
     * @param {String} method
     * @param {String} url
     * @returns {Unirest}
     */
    unirest: function(method, url) {
        return unirest[method](url)
            .headers(this.headers());
    }
};



module.exports = exports = ServiceContainer;