# Merchant Server

## Getting Started

npm install
npm run build
npm start

URL: http://localhost:8080/{env}
env: "stg", "qa", "uat", "prod"

Gateway and PaymentJSv2 developer app credentials are stored in env.js

Note: changes to env.js require rebuilding
Note2: for the webhook callback to work, an accessible webhook url needs to be registered in the developer app for PaymentJSv2
