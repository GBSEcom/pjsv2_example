export declare type CardConnectCredentials = {
    readonly gateway: "CARD_CONNECT";
    readonly merchantId: string;
    readonly apiUserAndPass: string;
};
export declare type FirstApiCredentials = {
    readonly gateway: "PAYEEZY" | "IPG_NA" | "RAPID_CONNECT";
    readonly apiKey: string;
    readonly apiSecret: string;
    readonly authToken: string;
    readonly transarmorToken?: string;
};
export declare type BluepayCredentials = {
    readonly gateway: "BLUEPAY";
    readonly accountId: string;
    readonly secretKey: string;
};
export declare type GatewayCredentials = FirstApiCredentials | BluepayCredentials | CardConnectCredentials;
export declare type ClientAuthRequest = {
    readonly credentials: GatewayCredentials;
    readonly clientIp: string;
    readonly zeroDollarAuth?: boolean;
};
export declare type ClientAuthSuccess = {
    readonly status: 1;
    readonly clientToken: string;
};
export declare type ClientAuthError = {
    readonly status: 0;
    readonly reason: string;
};
export declare type ClientAuthResponse = ClientAuthSuccess | ClientAuthError;
export declare type MerchantCredentials = {
    readonly apiKey: string;
    readonly apiSecret: string;
};
export declare type MerchantVelocitySettings = {
    readonly ipVelocityThreshold: number;
    readonly binVelocityThreshold: number;
    readonly minDeclinesVelocityThreshold: number;
    readonly lockDuration: number;
};
export declare type DebugInfo = {
    readonly pjsServerStatus: boolean;
    readonly velocitySettings: MerchantVelocitySettings | undefined;
    readonly velocityStatus: string;
};
export declare type ApiEndpointList = {
    readonly LOCAL: string;
    readonly DEV: string;
    readonly STG: string;
    readonly TEST: string;
    readonly CERT: string;
    readonly PROD: string;
};
export declare const ApiEndpoints: ApiEndpointList;
export declare class ApiClient {
    static readonly LOCAL: ApiClient;
    static readonly DEV: ApiClient;
    static readonly STG: ApiClient;
    static readonly TEST: ApiClient;
    static readonly CERT: ApiClient;
    static readonly PROD: ApiClient;
    private readonly baseUrl;
    constructor(baseUrl: string);
    checkConnection(): Promise<boolean>;
    authorizeClient(request: ClientAuthRequest): Promise<ClientAuthResponse>;
    getSettings(): Promise<MerchantVelocitySettings | undefined>;
    updateSettings(credentials: MerchantCredentials, settings: MerchantVelocitySettings): Promise<true>;
    getVelocityStatus(): Promise<string>;
    getDebugInfo(): Promise<DebugInfo | undefined>;
}
