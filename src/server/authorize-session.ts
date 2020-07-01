import axios from "axios";
import {createHmac} from "crypto";
import {
  EnvName,
  GatewayName,
  ISessionAuth,
  IAuthorizeSessionRequest,
  ServiceUrl,
} from "../common/pjs2";
import { IConfig } from "./config";

const getGatewayConfig = (config: IConfig, env: EnvName, gateway: GatewayName) => {
  const envConfig = config.gateways[env];
  if (envConfig) {
    const gatewayConfig = envConfig[gateway];
    if (gatewayConfig) {
      return gatewayConfig;
    }
  }
};

const getPaymentJsConfig = (config: IConfig, env: EnvName) => {
  if (config.pjs2[env]) {
    return config.pjs2[env];
  }
}

const getServiceUrl = (env: EnvName) => {
  if (env === EnvName.UAT) {
    return ServiceUrl.UAT;
  } else if (env === EnvName.PROD) {
    return ServiceUrl.PROD;
  }
};

const signMsg = (secret: string, msg: string) => createHmac("sha256", secret)
  .update(msg)
  .digest("base64");

const genTimestamp = () => new Date().getTime();

export const authorizeSession = async (config: IConfig, env: EnvName, gateway: GatewayName, nonce?: string): Promise<ISessionAuth> => {
  const gatewayConfig = getGatewayConfig(config, env, gateway);
  if (!gatewayConfig) {
    throw new Error(`failed to find gateway config for env "${env}" and gateway "${gateway}"`);
  }

  const paymentJsConfig = getPaymentJsConfig(config, env);
  if (!paymentJsConfig) {
    throw new Error(`failed to find paymentjs config for env "${env}"`);
  }

  const serviceUrl = getServiceUrl(env);
  if (!serviceUrl) {
    throw new Error(`failed to find paymentjs service url for env "${env}"`);
  }

  const timestamp = genTimestamp();

  const requestBody = JSON.stringify(gatewayConfig);

  const msgToSign = `${paymentJsConfig.apiKey}${nonce}${timestamp}${requestBody}`;
  const messageSignature = signMsg(paymentJsConfig.apiSecret, msgToSign);

  const httpParams = {
    data: requestBody,
    headers: {
      "Api-Key": paymentJsConfig.apiKey,
      "Content-Type": "application/json",
      "Content-Length": requestBody.length,
      "Message-Signature": messageSignature,
      "Nonce": nonce,
      "Timestamp": timestamp,
    },
    maxRedirects: 0,
    method: "POST",
    url: `${serviceUrl}/merchant/authorize-session`,
  } as const;

  return await axios.request(httpParams)
    .then((response) => {
      if (!response.data
        || !response.data.publicKeyBase64
        || !response.headers["client-token"]
        || !response.headers["nonce"]
        || response.headers["nonce"] !== nonce
      ) {
        throw new Error("did not receive expected data from paymentjs server during authorize session");
      }

      const publicKeyBase64 = response.data.publicKeyBase64;
      const clientToken = response.headers["client-token"];
      return { clientToken, publicKeyBase64 };
    });
};

