module.exports = {
  gateways: {
    nonprod: {
      BLUEPAY: {
        gateway: 'BLUEPAY',
        accountId: '',
        secretKey: '',
      },

      CARD_CONNECT: {
        gateway: 'CARD_CONNECT',
        apiUserAndPass: '',
        merchantId: '',
      },

      PAYEEZY: {
        gateway: 'PAYEEZY',
        apiKey: '',
        apiSecret: '',
        authToken: '',
        transarmorToken: '',
      }
    },

    prod: {
      BLUEPAY: {
        gateway: 'BLUEPAY',
        accountId: '',
        secretKey: '',
      },

      CARD_CONNECT: {
        gateway: 'CARD_CONNECT',
        apiUserAndPass: '',
        merchantId: '',
      },

      PAYEEZY: {
        gateway: 'PAYEEZY',
        apiKey: '',
        apiSecret: '',
        authToken: '',
        transarmorToken: '',
      }
    }
  },

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
