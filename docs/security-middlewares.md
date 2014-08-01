# Mashape-Tools Security Middlewares


## IP-Filter Middleware


### Full Example

```js
app.use(mashape.ipFilter({
    iplist: '/path/to/iplist.json', // or an array of IPs
    errorCode: 403,
    errorMessage: 'Forbidden',
    strict: false,
    debug: false,
    log: true,
    whiteplist: []
}));
```

A description of the configuration parameters can be found [here](configuration.md)


## HTTP-Header-Filter Middleware


### Full Example

```js
app.use(mashape.headerFilter({
    proxySecret: 'YourMashapeProxySecret',
    additionalHeaderChecks: [
        { name: 'x-your-header', value: 'your-header-value' }
    ],
    errorCode: 403,
    errorMessage: 'Forbidden',
    strict: false,
    debug: false,
    log: true,
    whiteplist: []
}));
```

A description of the configuration parameters can be found [here](configuration.md)
