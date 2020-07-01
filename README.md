# Merchant Server

## PaymentJSv2 Documentation

https://docs.paymentjs.firstdata.com/

## Getting Started

1. npm install
2. npm run build:server
3. npm run build:client
4. npm start

URL: http://localhost:3000/{env}

env: uat, prod


## Configuration

Gateway and PaymentJSv2 developer app credentials are stored in config.json

Note: for the webhook callback to work, an accessible webhook url needs to be registered in the developer app for PaymentJSv2.

## HTTPS

Generally you will have a server sitting in front of nodejs that
will handle the SSL handshake thus an https listener in the nodejs
code is not normally necessary.
It's easy to add in however as shown below:

```javascript
const express = require('express');
const https = require('https');

const app = express();

// ...

// see node documentation for additional options such as ssl passphrase
const options = {
  cert: fs.readFileSync(/* ... */),
  key: fs.readFileSync(/* ... */),
};

const httpsServer = https.createServer(options, app);
httpsServer.listen(443);
```

## Features

- integrates with PaymentJSv2 Client Library on the client side
- includes a gateway select field for testing different gateway integrations.

