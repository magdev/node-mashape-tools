# Mashape-Tools Configuration

The configuration object can be passed to all middlewares.

```js
var config = {
    // Path to a JSON-File with allowed IP-Addresses
    iplist: null,
    
    // Mashape Proxy-Secret
    proxySecret: null,
    
    // HTTP-Status-Code to send on invalid requests
    errorCode: 403,
    
    // HTTP-Status-Message to send on invalid requests
    errorMessage: 'Forbidden',
    
    // Delegate error-handling to express if true, otherwise just log the errors
    strict: true,
    
    // Enable logging
    log: true,
        
    // Enable debug-mode 
    debug: false,
    
    // List of additional header-checks
    additionalHeaderChecks: [
        { header: 'x-your-header', value: 'your-expected-value' }
    ],
    
    // List of allowed IPs, i.e. load balancers, applies on all middlewares 
    whitelist: [],
    
    // Your Mashape-Key, needed to perform autodiscovery calls (only for service-container)
    mashapeKey: 'YourMashapeKey',
    
    // Enable auto-discovery of APIs (only for service-container)
    autodiscovery: true
};
```