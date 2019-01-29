# Merchant Server

## PaymentJSv2 Documentation

https://docs.paymentjs.firstdata.com/v2

## Getting Started

npm install
npm run build
npm start

URL: http://localhost:3000/{env}
env: "stg", "qa", "uat", "prod"


## Configuration

Gateway and PaymentJSv2 developer app credentials are stored in env.js

Note: changes to env.js require rebuilding
Note2: for the webhook callback to work, an accessible webhook url needs to be registered in the developer app for PaymentJSv2.

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
- includes a gateway select field and a zero dollar auth
checkbox for testing different gateway integrations.
- includes an api client for /merchant/authorize-session in folder "sdk".


