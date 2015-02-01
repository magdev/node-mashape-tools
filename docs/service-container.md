# Mashape-Tools Service Container

The service container provides an easy interface to call mashape APIs on the fly anywhere in your application.


## Usage


### Full Example

```js
app.use(mashape.serviceContainer({
    mashapeKey: process.env.MASHAPE_KEY,
    debug: false
}));

app.get('/', function(req, res) {
    // The mashape service is auto-registered
    req.service.call('mashape', 'get', '/users/mashaper/apis/mashape', {}, function(result) {
        console.log(result);
    });
});
```

A description of the configuration parameters can be found [here](configuration.md)


## API

_(Coming soon)_


## Testing

To test the Service-Container you have to set a valid Mashape-Key as environment variable MASHAPE_KEY.
