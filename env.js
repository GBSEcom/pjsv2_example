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
      },

      IPG: {
        gateway: 'IPG',
        apiKey: '',
        apiSecret: '',
      },
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
    uat: {
      // PaymentJS apiKey
      apiKey: '',

      // PaymentJS apiSecret
      apiSecret: '',
    },
    prod: {
      apiKey: '',
      apiSecret: '',
    }
  },
};
