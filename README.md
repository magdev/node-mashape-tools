# node-mashape-tools 

Connect-style middlewares to perform security checks on your Mashape-API backend by validating HTTP-Headers and allowed Proxy-IPs.

[![Build Status](https://secure.travis-ci.org/magdev/node-mashape-tools.png?branch=master)](http://travis-ci.org/magdev/node-mashape-tools)


## Getting Started

Install the module with: `npm install mashape-tools`

To use the IP-Filter download the [official list of Mashape-IPs](https://www.mashape.com/docs/firewall) as JSON and store it within your application.

```js
var express = require('express'),
    app = express(),
    mashape = require('mashape-tools');

// Enable IP-Filter
app.use(mashape.ipFilter({
    iplist: '/path/to/iplist.json'
}));

// Enable Proxy-Secret-Filter
app.use(mashape.headerFilter({
    proxySecret: 'YourMashapeProxySecret',
    additionalHeaderChecks: [
        { name: 'x-your-header', value: 'your-header-value' }
    ]
}));

// ...
```


## Documentation

### Configuration

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
    
    // List of additional header-checks
    additionalHeaderChecks: [
        { header: 'x-your-header', value: 'your-expected-value' }
    ]
};
```

### IP-Filter

_(Coming soon)_


### HTTP-Header-Filter

_(Coming soon)_



## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Marco Grätsch  
Licensed under the [MIT license](LICENSE.md).
