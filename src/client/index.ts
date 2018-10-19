import axios, { AxiosResponse } from 'axios';
import { addClass, removeClass } from './dom';

const getEl = (selector) => window.document.querySelector(selector);
const ccFields = window.document.getElementsByClassName('payment-fields');
const btnLoader = getEl('.btn__loader');
const overlay = getEl('.overlay');
const statusMsg = getEl('.status');
const form = getEl('#form');
const submitBtn = getEl('[data-submit-btn]');
const cardType = getEl('[data-card-type]');
const resetBtn = getEl('[data-reset-btn]');
const destroyBtn = getEl('[data-destroy-btn]');
const getStateBtn = getEl('[data-getState-btn]');
const gatewaySelect = getEl('[data-gateway]');
const zauthCheck = getEl('[data-zauth]');
const envNameElem = getEl('#pjs2env');
const enablePaymentFields = () => {
  for (let i = 0; i < ccFields.length; i++) {
    removeClass(ccFields[i], 'disabled');
  }
};

const isBtnDisabled = (btnState: any) => {
  submitBtn.disabled = btnState;
};
const isBtnLoaderDisplayed = (state: any) => {
  const style = state ? 'inline-block' : 'none';
  btnLoader.style.display = style;
};
const enableForm = () => {
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.parentNode.removeChild(overlay);
    isBtnDisabled(false);
    enablePaymentFields();
    removeClass(submitBtn, 'disabled-bkg');
  }, 1000);
};
const removeSubmitState = () => {
  isBtnDisabled(false);
  isBtnLoaderDisplayed(false);
};
const setSubmitState = () => {
  statusMsg.style.opacity = '0';
  isBtnDisabled(true);
  isBtnLoaderDisplayed(true);
};

const isErrorMessage = (res: any, title: string) => {
  if (res && res.error) {
    statusMsg.style.opacity = '1';
    removeSubmitState();
    if (res.message) {
      statusMsg.innerHTML = res.message;
    } else if (res.status > 1) {
      statusMsg.innerHTML = `${title} Error: ${res.status}`;
    } else {
      console.log(res);
    }
    throw new Error(`${title} Error`);
  } else {
    return res;
  }
};

const reset = () => {
  window.firstdata.paymentFields.reset().then((res: any) => {
    console.log(res);
  });
};

const fmtClientTokenReq = (zeroDollarAuth: boolean, gateway: string) => ({
  headers: { 'Content-Type': 'application/json' },
  url: '/api/authorize-client',
  method: 'POST',
  data: { env: envNameElem.value, gateway, zeroDollarAuth },
});

const fmtGetWebhookResponseReq = (clientToken: string) => ({
  headers: { 'Content-Type': 'application/json' },
  url: `/api/tokenize-status/${clientToken}`,
  method: 'GET',
});

const requestClientToken = () =>
  axios(fmtClientTokenReq(zauthCheck.checked, gatewaySelect.options[gatewaySelect.selectedIndex].value))
    .then((res: AxiosResponse) => isErrorMessage(res.data, 'Authorize Client'));

const onNewTransaction = () => {
  getEl('[data-new-trans]').addEventListener('click', (e) => {
    e.preventDefault();
    form.style.display = 'block';
    statusMsg.innerHTML = '';
  });
};

const getWebhookResponse = (clientToken: string) =>
  axios(fmtGetWebhookResponseReq(clientToken))
    .then((res: AxiosResponse) => isErrorMessage(res.data, 'Webhook'));

const tryGetWebhookResponseHelper = (clientToken: string, maxAttempts: number, currentAttempt: number) => {
  if (currentAttempt < maxAttempts) {
    return getWebhookResponse(clientToken).catch((error: Error) => {
      return tryGetWebhookResponseHelper(clientToken, maxAttempts, currentAttempt + 1);
    });
  }
  return getWebhookResponse(clientToken)
};

const tryGetWebhookResponse = (clientToken: string) =>
  tryGetWebhookResponseHelper(clientToken, 3, 1);

const displayTransactionMsg = (res: any, clientToken: string) => {
  if (res.status !== 1) {
    throw new Error('error completing transaction');
  } else {
    addClass(submitBtn, 'success-bkg');
    setTimeout(() => {
      statusMsg.style.opacity = '1';
      addClass(statusMsg, 'success');
      statusMsg.innerHTML =
        'Transaction Complete (clientToken={' + clientToken + '}) <br><button class="btn--secondary" data-new-trans>New Transaction</button>';
      removeClass(submitBtn, 'success-bkg');
      cardType.innerHTML = '';
      removeSubmitState();
      form.style.display = 'none';
      reset();
      onNewTransaction();
    }, 1500);
    return res;
  }
};

const tokenize = (clientToken: any) => {
  if (!clientToken) {
    throw new Error('clientToken not set');
  } else {
    return window.firstdata.paymentFields.tokenize(clientToken).then((res: any) => isErrorMessage(res, 'Tokenize'));
  }
};

const isFormValid = () => {
  return window.firstdata.paymentFields
    .isFormValid()
    .then((res: any) => {
      if (res.error) {
        throw new Error('form not valid')
      }
      return true;
    });
};

const trySubmit = () => {
  let clientToken: string = '';
  requestClientToken()
    .then((res: any) => {
      clientToken = res.clientToken;
      return clientToken;
    })
    .then(tokenize)
    .then(() => tryGetWebhookResponse(clientToken))
    .then((res: any) => displayTransactionMsg(res, clientToken));
};

const onSubmit = () => {
  form.addEventListener('submit', (e: any) => {
    e.preventDefault();
    isFormValid()
      .then(setSubmitState)
      .then(trySubmit)
      .catch(error => {
        removeSubmitState();
        console.log(error);
      });
  });
};
const onReset = () => {
  resetBtn.addEventListener('click', (e: any) => {
    e.preventDefault();
    reset();
  });
};
const onDestroy = () => {
  destroyBtn.addEventListener('click', (e: any) => {
    e.preventDefault();
    window.firstdata.paymentFields
      .destroy()
      .then((res: any) => {
        console.log(res);
      })
      .catch((error: any) => {
        console.log(error);
      });
  });
};
const onGetState = () => {
  getStateBtn.addEventListener('click', (e: any) => {
    e.preventDefault();
    window.firstdata.paymentFields.getState().then((res: any) => {
      console.log('get state', res);
    });
  });
};
const onCardType = () => {
  window.firstdata.paymentFields.on('cardType', (res: any) => {
    cardType.innerHTML = res.brandNiceType ? `with ${res.brandNiceType}` : '';
  });
};
const formReady = () => {
  enableForm();
  onSubmit();
  onReset();
  onCardType();
  onDestroy();
  onGetState();
};
window.firstdata.paymentFields
  .create({
    styles: {
      input: {
        'font-size': '16px',
        color: '#00a9e0',
        'font-family': 'monospace',
        background: 'black',
      },
      '.card': {
        'font-family': 'monospace',
      },
      ':focus': {
        color: '#00a9e0',
      },
      '.valid': {
        color: '#43B02A',
      },
      '.invalid': {
        color: '#C01324',
      },
      '@media screen and (max-width: 700px)': {
        input: {
          'font-size': '18px',
        },
      },
      'input:-webkit-autofill': {
        '-webkit-box-shadow': '0 0 0 50px white inset',
      },
      'input:focus:-webkit-autofill': {
        '-webkit-text-fill-color': '#00a9e0',
      },
      'input.valid:-webkit-autofill': {
        '-webkit-text-fill-color': '#43B02A',
      },
      'input.invalid:-webkit-autofill': {
        '-webkit-text-fill-color': '#C01324',
      },
      'input::placeholder': {
        color: '#aaa',
      },
    },
    classes: {
      empty: 'empty',
      focus: 'focus',
      invalid: 'invalid',
      valid: 'valid',
    },
    fields: {
      name: {
        selector: '[data-cc-name]',
        placeholder: 'Full Name',
      },
      card: {
        selector: '[data-cc-card]',
      },
      cvv: {
        selector: '[data-cc-cvv]',
      },
      exp: {
        selector: '[data-cc-exp]',
      },
    },
  })
  .then((res: any) => isErrorMessage(res, 'Create Fields'))
  .then(formReady)
  .catch((error: any) => {
    console.log(error);
  });
