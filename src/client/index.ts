import axios, { AxiosError, AxiosResponse } from "axios";
import {polyfill} from "es6-promise";
import { addClass, removeClass } from "./dom";
import {
  Consumer, ICssClassList, ICssStyleList,
  IFailureResult, IFields,
  IPaymentForm,
  IPaymentFormHooks, ISessionAuth, IStateConfig,
  CustomEventName,
} from '../common/pjs2';
import {requestWebhookPayload, tryGetWebhookResult} from "./webhook";

polyfill();

const getEl = (selector: string) => window.document.querySelector(selector);
const ccFields = window.document.getElementsByClassName('payment-fields');
const btnLoader = getEl('.btn__loader') as HTMLElement;
const overlay = getEl('.overlay') as HTMLElement;
const statusMsg = getEl('.status') as HTMLElement;
const form = getEl('#form') as HTMLElement;
const submitBtn = getEl('[data-submit-btn]') as HTMLButtonElement;
const cardType = getEl('[data-card-type]') as HTMLElement;
const resetBtn = getEl('[data-reset-btn]') as HTMLButtonElement;
const destroyBtn = getEl('[data-destroy-btn]') as HTMLButtonElement;
const getStateBtn = getEl('[data-getState-btn]') as HTMLButtonElement;
const gatewaySelect = getEl('[data-gateway]') as HTMLSelectElement;
const envNameElem = getEl('#pjs2env') as HTMLInputElement;

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
    (overlay.parentNode as any).removeChild(overlay);
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

export const isErrorMessage = (res: any, title: string) => {
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

const reset = (paymentForm: IPaymentForm) => {
  paymentForm.reset(() => consoleLog("called paymentForm.reset"));
};

const reqHeaders = { 'Content-Type': 'application/json' };

const fmtSessionReq = (gateway: string) => ({
  headers: reqHeaders,
  url: '/api/authorize-session',
  method: 'POST' as "POST",
  data: { env: envNameElem.value, gateway },
});

const requestSession = (cb: Consumer<ISessionAuth>): void => {
  axios(fmtSessionReq(gatewaySelect.options[gatewaySelect.selectedIndex].value))
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
};

const onNewTransaction = () => {
  (getEl('[data-new-trans]') as any).addEventListener('click', (e: Event) => {
    e.preventDefault();
    form.style.display = 'block';
    statusMsg.innerHTML = '';
  });
};

const displayTransactionMsg = (paymentForm: IPaymentForm, res: any, clientToken: string) => {
  if (res.error) {
    throw new Error('error completing transaction');
  } else {
    addClass(submitBtn, 'success-bkg');
    const webhookPayloadPromise = requestWebhookPayload(clientToken);
    setTimeout(() => {
      removeSubmitState();
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

const onSubmit = (paymentForm: IPaymentForm) => {
  const onSuccess = (clientToken: string) => {
    tryGetWebhookResult(clientToken)
      .then((res: any) => isErrorMessage(res, 'Webhook'))
      .then((res: any) => displayTransactionMsg(paymentForm, res, clientToken));
  };

  const onError = (error: Error) => {
    consoleLog(error.toString());
    statusMsg.style.opacity = '1';
    removeSubmitState();
    statusMsg.innerHTML = `Tokenize Error: ${error.message}`;
  };

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    setSubmitState();
    paymentForm.onSubmit(onSuccess, onError);
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
    paymentForm.destroyFields(() => consoleLog("called paymentForm.destroyFields"));
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
  return new Promise<IPaymentForm>((resolve: Consumer<IPaymentForm>, reject: Consumer<IFailureResult>) => {
    try {
      (window as any).firstdata.createPaymentForm(config, hooks, resolve, logger);
    } catch (error) {
      reject({ error: true, reason: error.message });
    }
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
