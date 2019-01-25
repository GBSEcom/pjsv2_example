
import {IMerchantClient} from '../../sdk/types';
import {MerchantClient} from '../../sdk/merchant-client';
import {ServiceUrls} from '../../sdk/constants';

import * as envData from '../../env';

export interface Config {
  gateways: any;
  pjs2: any;
}

export type EnvName = "uat"|"prod";

const isEnvName = (env: any): env is EnvName =>
  env != null && (
    env === "uat" ||
    env === "prod"
  );

function getGatewayConfigForEnv(env: EnvName): any {
  if (env === 'prod') {
    return envData.gateways.prod;
  }
  return envData.gateways.nonprod;
}

function getPjsConfigForEnv(env: EnvName): any|never {
  if (envData.pjs2[env]) {
    return envData.pjs2[env];
  }
  throw new Error(`unsupported env "${env}"`);
}

function getApiClientForEnv(env: EnvName): IMerchantClient|never {
  const ENV_NAME = env.toUpperCase();
  if (ServiceUrls[ENV_NAME]) {
    const logger = (level: string, msg: string) => {
      console[level](msg);
    };
    return new MerchantClient(ServiceUrls[ENV_NAME], logger);
  }
  throw new Error(`unsupported env "${env}"`);
}

export class Context {

  public static for(env: string|undefined): Context {
    if (isEnvName(env)) {
      const client: IMerchantClient = getApiClientForEnv(env);
      const gateways: any = getGatewayConfigForEnv(env);
      const pjs2: any = getPjsConfigForEnv(env);
      return new Context(client, { gateways, pjs2 });
    } else {
      const errmsg = `ERROR: invalid env requested: "${env}"`;
      console.log(errmsg);
      throw new Error(errmsg);
    }
  }

  private readonly apiClient: IMerchantClient;
  private readonly apiConfig: Config;

  private constructor(client: IMerchantClient, config: Config) {
    this.apiClient = client;
    this.apiConfig = config;
  }

  public get client(): IMerchantClient {
    return this.apiClient;
  }

  public get apiSecret(): string {
    return this.apiConfig.pjs2.apiSecret;
  }

  public get apiKey(): string {
    return this.apiConfig.pjs2.apiKey;
  }

  public getGatewayCreds(gateway: string): any {
    return this.apiConfig.gateways[gateway];
  }
}
