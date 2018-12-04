
import * as pjs2 from "../../pjs2-apiclient";
import * as envData from "../../env";

export interface SslConfig {
  keyPath: string;
  certPath: string;
  passphrase?: string;
}

export interface Config {
  gateways: any;
  pjs2: any;
  ssl?: SslConfig|undefined;
}

function getGatewayConfigForEnv(env: string): any {
  if (env === "prod") {
    return envData.gateways.prod;
  }
  return envData.gateways.nonprod;
}

function getPjsConfigForEnv(env: string): any|never {
  if (envData.pjs2[env]) {
    return envData.pjs2[env];
  }
  throw new Error(`unsupported env "${env}"`);
}

function getApiClientForEnv(env: string): pjs2.ApiClient|never {
  const ENV_NAME = env.toUpperCase();
  if (pjs2.ApiClient[ENV_NAME]) {
    return pjs2.ApiClient[ENV_NAME];
  }
  throw new Error(`unsupported env "${env}"`);
}

export class Context {
  public static for(env: string): Context {
    const client: pjs2.ApiClient = getApiClientForEnv(env);
    const gatewayConfig: any = getGatewayConfigForEnv(env);
    const pjsConfig: any = getPjsConfigForEnv(env);

    const sslConfig: SslConfig|undefined = envData.ssl;
    return new Context(client, {
      gateways: gatewayConfig,
      pjs2: pjsConfig,
      ssl: sslConfig,
    });
  }

  public static hasSsl(): boolean {
    if (envData.ssl) {
      return true;
    }
    return false;
  }

  public static getSslConfig(): SslConfig|never {
    if (!Context.hasSsl()) {
      throw new Error("cannot get ssl config, not configured");
    }
    return envData.ssl;
  }

  private readonly apiClient: pjs2.ApiClient;
  private readonly apiConfig: Config;

  private constructor(client: pjs2.ApiClient, config: Config) {
    this.apiClient = client;
    this.apiConfig = config;
  }

  public get client(): pjs2.ApiClient {
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
