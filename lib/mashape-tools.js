/**
 * mashape-tools
 * https://github.com/magdev/node-mashape-tools
 *
 * Copyright (c) 2014 Marco Grätsch
 * Licensed under the MIT license.
 */

'use strict';

var extend = require('xtend'),
    
    /** Mashape-specific proxy-secret header */
    PROXY_SECRET_HEADER = 'x-mashape-proxy-secret',
    
    /** Mashape-specific header to identify the current user */
    USER_HEADER = 'x-mashape-user',

    /** Default Configuration */
    defaultConfig = {
        /** Path to a JSON-File or an Array with allowed IP-Addresses */
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
        
        /** Enable debug-mode */
        debug: false,
        
        /** List of additional header-checks */
        additionalHeaderChecks: [],
        
        /** List of allowed IPs, i.e. load balancers, applies on all middlewares */
        whitelist: []
    },
    
    
    /**
     * Find the Client-IP
     * 
     * @param {Request} req
     * @param {Boolean} useProxy
     * @param {Boolean} debug
     * @returns String
     */
    clientIP = function(req, useProxy, debug) {
		var ips = req.get('x-forwarded-for');
		if (ips) {
			ips = ips.split(',');
			
			if (ips.length && useProxy) {
				var ip;
				if (ips.length === 1) {
					ip = ips[0];
					if (debug) {
						console.log('Single Proxy IP: %s', ip);
					}
					return ip;
				}

				if (debug) {
					console.log('Multiple Proxy IPs: %s', ips.join(', '));
				}
				
				ip = ips.pop();
				if (debug) {
					console.log('Using IP: %s', ip);
				}
				return ip;
            }
		}
		
		if (debug) {
			console.log('No Proxies, Using IP: %s', req.ip);
		}
        return req.ip;
    },
    
    
    /**
     * Log some mashape-specific headers (for debugging)
     * 
     * @param {Request} req
     */
    logRequest = function(req) {
        console.log({
            'x-mashape-user': req.get('x-mashape-user'),
            'x-mashape-version': req.get('x-mashape-version'),
            'x-mashape-proxy-secret': req.get('x-mashape-proxy-secret'),
            'x-forwarded-for': req.get('x-forwarded-for'),
            'ips': req.ips,
            'ip': req.ip
        });
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
                var ip = clientIP(req, true, config.debug),
                    user = req.get(USER_HEADER) || 'UNKNOWN',
                    iplist = typeof config.iplist === String ? require(config.iplist) : config.iplist;

                if (config.debug) {
                    logRequest(req);
                }
                    
                if ((!iplist || !iplist.length) && (!config.whitelist || !config.whitelist.length)) {
                    var e = new Error('No IP-list or whitelist defined, skipping ipFilter()');
                    if (config.strict) {
                        return next(e);
                    }
                    if (config.debug) {
                        console.log(e.message);
                    }
                    return next();
                }
                
                // Check if IP is whitelisted
                if (config.whitelist && config.whitelist.indexOf(ip) !== -1) {
                    if (config.log || config.debug) {
                        console.log('Access granted for user %s, IP address: %s (whitelisted)', user, ip);
                    }
                    return next();
                }
                
                // Check if ip is on the iplist
                if (iplist.indexOf(ip) !== -1) {
                    if (config.log || config.debug) {
                        console.log('Access granted for user %s, IP address: %s', user, ip);
                    }
                    return next();
                }

                if (config.log || config.debug) {
                    console.log('Access denied to user %s, IP address: %s', user, ip);
                }
                res.statusCode = config.errorCode;
                return res.end(config.errorMessage);
            } catch (e) {
                if (config.strict) {
                    return next(e);
                }
                if (config.debug) {
                    console.log(e);
                }
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
                var ip = clientIP(req, true, config.debug),
                    user = req.get(USER_HEADER) || 'UNKNOWN';

                if (config.debug) {
                    logRequest(req);
                }
                
                if (!config.proxySecret && (!config.additionalHeaderChecks || !config.additionalHeaderChecks.length)) {
                    var e = new Error('No Proxy-Secret or additional header checks defined, skipping headerFilter()');
                    if (config.strict) {
                        return next(e);
                    }
                    if (config.debug) {
                        console.log(e.message);
                    }
                    return next();
                }

                // Check if IP is whitelisted
                if (config.whitelist && config.whitelist.indexOf(ip) !== -1) {
                    if (config.log || config.debug) {
                        console.log('Access granted for user %s, IP address: %s (whitelisted)', user, ip);
                    }
                    return next();
                }

                // Check Proxy-Secret
                if (config.proxySecret) {
                    var secret = req.get(PROXY_SECRET_HEADER);
                    if (!secret || (secret && secret !== config.proxySecret)) {
                        if (config.log || config.debug) {
                            console.log('Access denied for user %s, cause: Invalid Proxy-Secret [%s]', user, secret);
                        }
                        res.statusCode = config.errorCode;
                        return res.end(config.errorMessage);
                    }
                }
                
                // Perform additional header checks
                if (config.additionalHeaderChecks && config.additionalHeaderChecks.length) {
                    for (var i = 0; i < config.additionalHeaderChecks.length; i++) {
                        var check = config.additionalHeaderChecks[i],
                            header = req.get(check.name);
                        
                        if (!header || !check.value || (header && header !== check.value)) {
                            if (config.log || config.debug) {
                                console.log('Access denied for user %s, cause: Invalid HTTP-Header [%s = %s]', user, check.name, header);
                            }
                            res.statusCode = config.errorCode;
                            return res.end(config.errorMessage);
                        }
                    }
                }
                
                if (config.log || config.debug) {
                    console.log('Access granted to user %s', user);
                }
                return next();
            } catch (e) {
                if (config.strict) {
                    return next(e);
                }
                if (config.debug) {
                    console.log(e);
                }
                return next();
            }
        };
    }
};