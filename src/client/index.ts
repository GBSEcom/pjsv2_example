import axios, { AxiosError, AxiosResponse } from 'axios';
import {polyfill} from 'es6-promise';
import { addClass, removeClass } from './dom';
import {
  ConsumerFn, ICssClassList, ICssStyleList,
  IFailureResult, IFields,
  IPaymentForm,
  IPaymentFormHooks, ISessionAuth, IStateConfig,
  ITokenizeSuccess,
  TokenizeResult,
} from '../../sdk/types';
import { CustomEventName } from '../../sdk/constants';

polyfill();

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

const consoleLog = (data: any) =>
  console.log(JSON.stringify(data, null, 2));

const enablePaymentFields = () => {
  for (let i = 0; i < ccFields.length; i++) {
    removeClass(ccFields[i], 'disabled');
  }
};

const setButtonLoaderDisplayState = (state: boolean) => {
  btnLoader.style.display = ( state ? 'inline-block' : 'none' );
};

const enableForm = () => {
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.parentNode.removeChild(overlay);
    submitBtn.disabled = false;
    enablePaymentFields();
    removeClass(submitBtn, 'disabled-bkg');
  }, 1000);
};

const removeSubmitState = () => {
  submitBtn.disabled = false;
  setButtonLoaderDisplayState(false);
};

const setSubmitState = () => {
  statusMsg.style.opacity = '0';
  submitBtn.disabled = true;
  setButtonLoaderDisplayState(true);
};

const isErrorMessage = (res: any, title: string) => {
  if (res && res.error) {
    statusMsg.style.opacity = '1';
    removeSubmitState();
    consoleLog(res);
    if (res.reason) {
      statusMsg.innerHTML = res.reason;
    } else if (res.status > 1) {
      statusMsg.innerHTML = `${title} Error: ${res.status}`;
    }
    throw new Error(`${title} Error`);
  } else {
    return res;
  }
};

const reset = (paymentForm: IPaymentForm) => paymentForm.reset(consoleLog);

const reqHeaders = { 'Content-Type': 'application/json' };

const fmtSessionReq = (zeroDollarAuth: boolean, gateway: string) => ({
  headers: reqHeaders,
  url: '/api/authorize-client',
  method: 'POST',
  data: { env: envNameElem.value, gateway, zeroDollarAuth },
});

const fmtGetWebhookResultReq = (clientToken: string) => ({
  headers: reqHeaders,
  url: `/api/tokenize-status/${clientToken}`,
  method: 'GET',
});

const fmtGetWebhookPayloadReq = (clientToken: string) => ({
  url: `/api/responses/${clientToken}`,
  method: 'GET',
});

const requestWebhookPayload = (clientToken: string) => (
  axios(fmtGetWebhookPayloadReq(clientToken))
    .then((res: AxiosResponse) => res.data)
);

const requestSession = (cb: ConsumerFn<ISessionAuth>) =>
  axios(fmtSessionReq(zauthCheck.checked, gatewaySelect.options[gatewaySelect.selectedIndex].value))
    .then((res: AxiosResponse) => isErrorMessage(res.data, 'Authorize Client'))
    .then(cb)
    .catch((err: AxiosError) => {
      statusMsg.style.opacity = '1';
      removeSubmitState();
      if (err.response) {
        if (err.response.data && err.response.data.error) {
          statusMsg.innerHTML = `${err.response.data.error}: HTTP ${err.response.status}`;
        } else {
          statusMsg.innerHTML = `Unknown session error: HTTP 500`;
          statusMsg.innerHTML = `Unknown session error: HTTP ${err.response.status}`;
        }
      } else {
        statusMsg.innerHTML = `Unknown session error: HTTP 500`;
      }
      throw new Error("Session Authorization Error");
    });

const onNewTransaction = () => {
  getEl('[data-new-trans]').addEventListener('click', (e) => {
    e.preventDefault();
    form.style.display = 'block';
    statusMsg.innerHTML = '';
  });
};

const delay = (milli: number, v?: any) => {
  return new Promise<any>((resolve) => {
    setTimeout(resolve.bind(null, v), milli);
  });
};

const getWebhookResult = (clientToken: string) =>
  axios(fmtGetWebhookResultReq(clientToken))
    .then((res: AxiosResponse) => isErrorMessage(res.data, 'Webhook'));

const tryGetWebhookResultHelper = (clientToken: string, maxAttempts: number, currentAttempt: number) => {
  if (currentAttempt < maxAttempts) {
    return delay(300).then(() => getWebhookResult(clientToken).catch((error: Error) => {
      return tryGetWebhookResultHelper(clientToken, maxAttempts, currentAttempt + 1);
    }));
  }
  return getWebhookResult(clientToken)
};

const tryGetWebhookResult = (clientToken: string) =>
  tryGetWebhookResultHelper(clientToken, 3, 1);

const displayTransactionMsg = (paymentForm: IPaymentForm, res: any, clientToken: string) => {
  if (res.error) {
    throw new Error('error completing transaction');
  } else {
    addClass(submitBtn, 'success-bkg');
    const webhookPayloadPromise = requestWebhookPayload(clientToken);
    setTimeout(() => {
      webhookPayloadPromise.then((payload: any) => {
        statusMsg.style.opacity = '1';
        addClass(statusMsg, 'success');

        const successStyle = "color: #004164; background-color: #e1eff7;";
        const errorStyle = "color: #a70000; background-color: #ffbaba;";

        const responseStyle = `overflow-x:auto; border-radius: 10px; ${
          (payload.response.error ? errorStyle : successStyle)
        }`;

        const strPayload = JSON.stringify(payload, null, 2);
        const responseHtml = `<pre style="${responseStyle}">${strPayload}</pre>`;

        const btnHtml = "<button class=\"btn--secondary\" data-new-trans>New Transaction</button>";

        statusMsg.innerHTML =
          `Transaction Complete<br>${btnHtml}<br>${responseHtml}`;
        removeClass(submitBtn, 'success-bkg');
        cardType.innerHTML = '';
        removeSubmitState();
        form.style.display = 'none';
        reset(paymentForm);
        onNewTransaction();
      });
    }, 1500);
    return res;
  }
};

const tokenize = (paymentForm: IPaymentForm): Promise<TokenizeResult> => {
  return new Promise<TokenizeResult>((resolve: ConsumerFn<TokenizeResult>) => {
    paymentForm.tokenize(resolve);
  });
};

const trySubmit = (paymentForm: IPaymentForm) => {
  let clientToken: string = '';
  tokenize(paymentForm)
    .then((result: TokenizeResult) => isErrorMessage(result, "Tokenize"))
    .then((result: ITokenizeSuccess) => {
      clientToken = result.clientToken;
      return tryGetWebhookResult(clientToken);
    })
    .then((res: any) => displayTransactionMsg(paymentForm, res, clientToken));
};

const onSubmit = (paymentForm: IPaymentForm) => {
  form.addEventListener('submit', (e: any) => {
    e.preventDefault();
    if (paymentForm.isValid()) {
      try {
        setSubmitState();
        trySubmit(paymentForm);
      } catch (error) {
        removeSubmitState();
        consoleLog(error.toString());
      }
    } else {
      removeSubmitState();
      consoleLog('form not valid');
    }
  });
};

const onReset = (paymentForm: IPaymentForm) => {
  resetBtn.addEventListener('click', (e: any) => {
    e.preventDefault();
    reset(paymentForm);
  });
};

const onDestroy = (paymentForm: IPaymentForm) => {
  destroyBtn.addEventListener('click', (e: any) => {
    e.preventDefault();
    paymentForm.destroy(consoleLog);
  });
};

const onGetState = (paymentForm: IPaymentForm) => {
  getStateBtn.addEventListener('click', (e: any) => {
    e.preventDefault();
    paymentForm.getState(consoleLog);
  });
};

const onCardType = (paymentForm: IPaymentForm) => {
  paymentForm.on(CustomEventName.CARD_TYPE, (res: any) => {
    cardType.innerHTML = res.brandNiceType ? `with ${res.brandNiceType}` : '';
  });
};

const getStateConfig = (): IStateConfig => {
  const styles: ICssStyleList = {
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
  };

  const classes: ICssClassList = {
    empty: 'empty',
    focus: 'focus',
    invalid: 'invalid',
    valid: 'valid',
  };

  const fields: IFields = {
    card: {
      selector: '[data-cc-card]',
    },
    cvv: {
      selector: '[data-cc-cvv]',
    },
    exp: {
      selector: '[data-cc-exp]',
    },
    name: {
      selector: '[data-cc-name]',
      placeholder: 'Full Name',
    },
  };

  return { classes, fields, styles };
};

const createAsync = (config: IStateConfig, hooks: IPaymentFormHooks): Promise<IPaymentForm> => {
  const logger = (level: string, msg: string) => console.log(msg);
  return new Promise<IPaymentForm>((resolve: ConsumerFn<IPaymentForm>, reject: ConsumerFn<IFailureResult>) => {
    window.firstdata.createPaymentForm(config, hooks, (result: IPaymentForm|IFailureResult) => {
        if ("error" in result) {
          reject(result);
        } else {
          resolve(result);
        }
      }, logger);
  })
};

createAsync(getStateConfig(), { preFlowHook: requestSession })
  .then((res: any) => isErrorMessage(res, 'Create Fields'))
  .then((paymentForm: IPaymentForm) => {
    enableForm();
    onSubmit(paymentForm);
    onReset(paymentForm);
    onCardType(paymentForm);
    onDestroy(paymentForm);
    onGetState(paymentForm);
  })
  .catch(consoleLog);
