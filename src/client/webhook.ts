import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const delay = (milli: number, v?: any) => {
  return new Promise<any>((resolve) => {
    setTimeout(resolve.bind(null, v), milli);
  });
};

export const tryGetWebhookResult = (clientToken: string) => {
  console.log(`entering tryGetWebhookResult (clientToken: ${clientToken})`);
  const maxAttempts = 5;
  const req: AxiosRequestConfig = {
    url: `/api/tokenize-status/${clientToken}`,
    method: 'GET',
  };

  const makeRequest = () => axios(req)
    .then((res: AxiosResponse) => {
      if (res.data.error) {
        return Promise.reject(new Error(res.data.reason));
      }
      return res.data;
    });

  const tryGetWebhookResultHelper = (
    currentAttempt: number,
  ): Promise<any> => {
    if (currentAttempt < maxAttempts) {
      return delay(300)
        .then(makeRequest)
        .catch(() => tryGetWebhookResultHelper(currentAttempt + 1));
    }
    return axios(req)
      .then((res: AxiosResponse) => res.data);
  };


  return tryGetWebhookResultHelper(1);
}

export const requestWebhookPayload = (clientToken: string) => (
  axios({
    url: `/api/responses/${clientToken}`,
    method: 'GET',
  })
    .then((res: AxiosResponse) => res.data)
);

