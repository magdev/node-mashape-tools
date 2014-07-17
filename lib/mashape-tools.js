/**
 * mashape-tools
 * https://github.com/magdev/node-mashape-tools
 *
 * Copyright (c) 2014 Marco Grätsch
 * Licensed under the MIT license.
 */

'use strict';

var extend = require('xtend'),
    ipfilter = require('ipfilter'),
    
    /** Mashape-specific proxy-secret header */
    PROXY_SECRET_HEADER = 'x-mashape-proxy-secret',
    
    /** Mashape-specific header to identify the current user */
    USER_HEADER = 'x-mashape-user',

    /** Default Configuration */
    defaultConfig = {
        /** Path to a JSON-File with allowed IP-Addresses */
        iplist: null,
        
        /** Mashape Proxy-Secret */
        proxySecret: null,
        
        /** HTTP-Status-Code to send on invalid requests */
        errorCode: 403,
        
        /** HTTP-Status-Message to send on invalid requests */
        errorMessage: 'Forbidden',
        
        /** Throw errors on invalid requests */
        strict: true,
        
        /** Enable logging */
        log: true,
        
        /** List of additional header-checks */
        additionalHeaderChecks: []
    };


module.exports = exports = {
    
    /**
     * Middleware to filter clients by IP-Address
     * 
     * @param {Object} config
     * @returns {Function}
     */
    ipFilter: function(config) {
        config = extend(defaultConfig, (config || {}));
        
        return function(req, res, next) {
            try {
                var iplist = require(config.iplist);
                if (!iplist || typeof iplist !== Array || !iplist.length) {
                    var e = new Error('No IP-list defined, skipping ipFilter()');
                    if (config.strict) {
                        return next(e);
                    }
                    console.log(e.message);
                    return next();
                }
                
                req.app.use(ipfilter(iplist, { 
                    mode: 'allow',
                    errorCode: config.errorCode,
                    errorMessage: config.errorMessage,
                    log: config.log
                }));
            } catch (e) {
                if (config.strict) {
                    return next(e);
                }
                console.log(e);
                return next();
            }
        };
    },
    
    
    /**
     * Middleware to filter clients by Proxy-Secret
     * 
     * @param {Object} config
     * @returns {Function}
     */
    headerFilter: function(config) {
        config = extend(defaultConfig, (config || {}));
        
        return function(req, res, next) {
            try {
                var user = req.get(USER_HEADER) || 'UNKNOWN';
                
                if (!config.proxySecret && (!config.additionalHeaderChecks || !config.additionalHeaderChecks.length)) {
                    var e = new Error('No Proxy-Secret or additional header checks defined, skipping headerFilter()');
                    if (config.strict) {
                        return next(e);
                    }
                    console.log(e.message);
                    return next();
                }

                // Check Proxy-Secret
                if (config.proxySecret) {
                    var secret = req.get(PROXY_SECRET_HEADER);
                    if (!secret || (secret && secret !== config.proxySecret)) {
                        if (config.log) {
                            console.log('Access denied for user %s, cause: Invalid Proxy-Secret [%s]', user, secret);
                        }
                        res.statusCode = config.errorCode;
                        return res.end(config.errorMessage);
                    }
                }
                
                // Perform additional header checks
                if (typeof config.additionalHeaderChecks === Array && config.additionalHeaderChecks.length) {
                    config.additionalHeaderChecks.forEach(function(check) {
                        var header = req.get(check.header);
                        if (!header || !check.value || (header && header !== check.value)) {
                            if (config.log) {
                                console.log('Access denied for user %s, cause: Invalid HTTP-Header [%s = %s]', user, check.header, header);
                            }
                            res.statusCode = config.errorCode;
                            return res.end(config.errorMessage);
                        }
                    });
                }
                
                if (config.log) {
                    console.log('Access granted to user %s', user);
                }
                return next();
            } catch (e) {
                if (config.strict) {
                    return next(e);
                }
                console.log(e);
                return next();
            }
        };
    }
};