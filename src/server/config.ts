import {TypeUtils} from "@bcg-ts/ts-toolkit";
import * as fs from "fs";
import * as path from "path";
import {promisify} from "util";
import {
  EnvName,
  GatewayName,
  IBluepayCredentials,
  ICardConnectCredentials,
  IIPGCredentials,
  IPayeezyCredentials,
} from "../common/pjs2";

export interface IPaymentJsCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface IGatewayCredentialMap {
  [GatewayName.BLUEPAY]?: IBluepayCredentials;
  [GatewayName.CARD_CONNECT]?: ICardConnectCredentials;
  [GatewayName.PAYEEZY]?: IPayeezyCredentials;
  [GatewayName.IPG]?: IIPGCredentials;
}

export interface IConfig {
  gateways: {
    [EnvName.UAT]?: IGatewayCredentialMap;
    [EnvName.PROD]?: IGatewayCredentialMap;
  };

  pjs2: {
    [EnvName.UAT]?: IPaymentJsCredentials;
    [EnvName.PROD]?: IPaymentJsCredentials;
  }
}

const isPaymentJsCredentials = (data: unknown): data is IPaymentJsCredentials =>
  TypeUtils.object(data) &&
  TypeUtils.field(data, "apiKey", TypeUtils.string) &&
  TypeUtils.field(data, "apiSecret", TypeUtils.string);

const isBluepayCredentials = (data: unknown): data is IBluepayCredentials =>
  TypeUtils.object(data) &&
  TypeUtils.field(data, "gateway", TypeUtils.string) &&
  TypeUtils.field(data, "accountId", TypeUtils.string) &&
  TypeUtils.field(data, "secretKey", TypeUtils.string) &&
  TypeUtils.field(data, "zeroDollarAuth", TypeUtils.boolean) &&
  data.gateway === GatewayName.BLUEPAY;

const isCardConnectCredentials = (data: unknown): data is ICardConnectCredentials =>
  TypeUtils.object(data) &&
  TypeUtils.field(data, "gateway", TypeUtils.string) &&
  TypeUtils.field(data, "apiUserAndPass", TypeUtils.string) &&
  TypeUtils.field(data, "merchantId", TypeUtils.string) &&
  TypeUtils.field(data, "zeroDollarAuth", TypeUtils.boolean) &&
  data.gateway === GatewayName.CARD_CONNECT;

const isPayeezyCredentials = (data: unknown): data is IPayeezyCredentials =>
  TypeUtils.object(data) &&
  TypeUtils.field(data, "gateway", TypeUtils.string) &&
  TypeUtils.field(data, "apiKey", TypeUtils.string) &&
  TypeUtils.field(data, "apiSecret", TypeUtils.string) &&
  TypeUtils.field(data, "authToken", TypeUtils.string) &&
  TypeUtils.field(data, "transarmorToken", TypeUtils.string) &&
  TypeUtils.field(data, "zeroDollarAuth", TypeUtils.boolean) &&
  data.gateway === GatewayName.PAYEEZY;

const isIpgCredentials = (data: unknown): data is IIPGCredentials =>
  TypeUtils.object(data) &&
  TypeUtils.field(data, "gateway", TypeUtils.string) &&
  TypeUtils.field(data, "apiKey", TypeUtils.string) &&
  TypeUtils.field(data, "zeroDollarAuth", TypeUtils.boolean) &&
  TypeUtils.optField(data, "storeId", TypeUtils.string) &&
  data.gateway === GatewayName.IPG;

const isGatewayCredentialMap = (data: unknown): data is IGatewayCredentialMap =>
  TypeUtils.object(data) &&
  TypeUtils.optField(data, GatewayName.BLUEPAY, isBluepayCredentials) &&
  TypeUtils.optField(data, GatewayName.CARD_CONNECT, isCardConnectCredentials) &&
  TypeUtils.optField(data, GatewayName.PAYEEZY, isPayeezyCredentials) &&
  TypeUtils.optField(data, GatewayName.IPG, isIpgCredentials);

const isApplicationConfig = (data: unknown): data is IConfig =>
  TypeUtils.object(data) &&
  TypeUtils.field(data, "gateways", TypeUtils.object) &&
  TypeUtils.field(data, "pjs2", TypeUtils.object) &&
  TypeUtils.optField(data.gateways, EnvName.UAT, isGatewayCredentialMap) &&
  TypeUtils.optField(data.gateways, EnvName.PROD, isGatewayCredentialMap) &&
  TypeUtils.optField(data.pjs2, EnvName.UAT, isPaymentJsCredentials) &&
  TypeUtils.optField(data.pjs2, EnvName.PROD, isPaymentJsCredentials);

const readFileAsync = promisify(fs.readFile);

export const loadConfigAsync = async (): Promise<IConfig> => {
  // path is relative to build location and resolves to root project directory
  const configPath = path.resolve("config.json");
  const configJsonBuffer = await readFileAsync(configPath);
  const config = JSON.parse(configJsonBuffer.toString());

  if (isApplicationConfig(config)) {
    return config;
  }
  throw new Error("failed to validate config.json");
};

