module.exports = {
  gateways: {
    nonprod: {
      BLUEPAY: {
        gateway: 'BLUEPAY',

        // 12-digit BluePay 2.0 ACCOUNT_ID
        accountId: '',

        // BluePay 2.0 SECRET_KEY
        secretKey: '',
      },

      CARD_CONNECT: {
        gateway: 'CARD_CONNECT',

        // Card Connect API credentials: "USERNAME:PASSWORD"
        apiUserAndPass: '',

        // Card Connect Merchant ID
        merchantId: '',
      },

      PAYEEZY: {
        gateway: 'PAYEEZY',

        // Developer App Consumer Key
        apiKey: '',

        // Developer App Consumer Secret
        apiSecret: '',

        // maps to the "token" header for "Tokenize Credit Card"
        // in payeezy api
        authToken: '',

        // maps to the "ta_token" payload property for "Tokenize Credit Card"
        // in payeezy api
        transarmorToken: '',
      }
    },

    prod: {
      BLUEPAY: {
        gateway: 'BLUEPAY',

        // 12-digit BluePay 2.0 ACCOUNT_ID
        accountId: '',

        // BluePay 2.0 SECRET_KEY
        secretKey: '',
      },

      CARD_CONNECT: {
        gateway: 'CARD_CONNECT',

        // Card Connect API credentials: "USERNAME:PASSWORD"
        apiUserAndPass: '',

        // Card Connect Merchant ID
        merchantId: '',
      },

      PAYEEZY: {
        gateway: 'PAYEEZY',

        // Developer App Consumer Key
        apiKey: '',

        // Developer App Consumer Secret
        apiSecret: '',

        // maps to the "token" header for "Tokenize Credit Card"
        // in payeezy api
        authToken: '',

        // maps to the "ta_token" payload property for "Tokenize Credit Card"
        // in payeezy api
        transarmorToken: '',
      }
    }
  },

  // PaymentJS V2 specific merchant api credentials
  pjs2: {
    test: {
      apiKey: '',
      apiSecret: '',
    },
    prod: {
      apiKey: '',
      apiSecret: '',
    }
  }
};
