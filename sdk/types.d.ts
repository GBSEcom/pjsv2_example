import { CustomEventName, FieldName, GatewayName } from "./constants";
export declare type ConsumerFn<T> = (data: T) => void;
export interface ICardData {
    [FieldName.CARD]: string;
    [FieldName.CVV]: string;
    [FieldName.EXP]: string;
    [FieldName.NAME]: string;
}
export declare type BiConsumerFn<A, B> = (first: A, second: B) => void;
export interface ICssClassList {
    empty: string;
    focus: string;
    invalid: string;
    valid: string;
}
export interface ICssStyle {
    [index: string]: string | ICssStyle;
}
export interface ICssStyleList {
    [index: string]: ICssStyle;
}
export interface IField {
    selector: string;
    placeholder?: string;
}
export interface IFields {
    card: IField;
    cvv: IField;
    exp: IField;
    name: IField;
}
export interface IStateConfig {
    fields: IFields;
    classes?: ICssClassList;
    styles?: ICssStyleList;
}
declare global {
    interface Window {
        firstdata: {
            createPaymentForm: (config: IStateConfig, hooks: IPaymentFormHooks, cb: ConsumerFn<IPaymentForm | IFailureResult>, logger?: BiConsumerFn<string, string>) => void;
        };
    }
}
export interface IMessage {
    message: string | object;
}
export interface ISessionAuth {
    clientToken: string;
    publicKeyBase64: string;
}
export interface IMerchantClient {
    authorizeSession(reqData: IAuthorizeSessionRequest): Promise<ISessionAuth>;
    tokenizeCard(auth: ISessionAuth, data: ICardData): Promise<boolean>;
}
export interface IBluepayCredentials {
    readonly gateway: GatewayName.BLUEPAY;
    readonly accountId: string;
    readonly secretKey: string;
    readonly zeroDollarAuth: boolean;
}
export interface ICardConnectCredentials {
    readonly gateway: GatewayName.CARD_CONNECT;
    readonly merchantId: string;
    readonly apiUserAndPass: string;
    readonly zeroDollarAuth: boolean;
}
export interface IIPGCredentials {
    readonly gateway: GatewayName.IPG;
    readonly apiKey: string;
    readonly apiSecret: string;
    readonly zeroDollarAuth: boolean;
}
export interface IPayeezyCredentials {
    readonly gateway: GatewayName.PAYEEZY;
    readonly apiKey: string;
    readonly apiSecret: string;
    readonly authToken: string;
    readonly transarmorToken?: string;
    readonly zeroDollarAuth: boolean;
}
export declare type GatewayCredentials = IBluepayCredentials | ICardConnectCredentials | IPayeezyCredentials | IIPGCredentials;
export interface IAuthorizeSessionRequest {
    gatewayConfig: GatewayCredentials;
    apiSecret: string;
    apiKey: string;
    nonce?: string | number;
    timestamp?: number;
    msgSignature?: string;
}
export declare type FieldValidity = IFieldValidity<FieldName.CVV> | IFieldValidity<FieldName.EXP> | IFieldValidity<FieldName.NAME> | ICardFieldValidity;
interface IResult {
    error: boolean;
}
export interface ISuccessResult extends IResult {
    error: false;
}
export interface IFailureResult extends IResult {
    reason: string;
    error: true;
}
export declare type Result = ISuccessResult | IFailureResult;
export declare type ValidationItem = FieldValidity & {
    selector: string;
};
export interface IValidationFailure extends IFailureResult {
    error: true;
    reason: string;
    items: ValidationItem[];
}
export declare type ValidationResult = ISuccessResult | IValidationFailure;
export interface IFrameStatus {
    field: FieldName;
    destroyed: boolean;
}
export interface IFieldValidity<F extends FieldName = FieldName> {
    empty: boolean;
    field: F;
    length: number;
    potentiallyValid: boolean;
    touched: boolean;
    valid: boolean;
}
export interface ICardFieldValidity extends IFieldValidity<FieldName.CARD> {
    brand: string;
    brandNiceType: string;
}
export declare type FormValidity = {
    [F in FieldName]: IFieldValidity<F>;
} & {
    card: ICardFieldValidity;
};
export declare type FieldEventHandlerCallback = ConsumerFn<{
    field: string;
    selector: string;
} | {
    brand: string;
    brandNiceType: string;
    code: string | {};
    field: ICardFieldValidity["field"];
    potentiallyValid: boolean;
    selector: string;
    valid: boolean;
}>;
export interface ITokenizeSuccess extends ISuccessResult {
    clientToken: string;
}
export declare type TokenizeResult = ITokenizeSuccess | IFailureResult;
export interface IPaymentFormHooks {
    readonly preFlowHook: (cb: ConsumerFn<ISessionAuth>) => void;
}
export interface IPaymentForm {
    /**
     * @description removes iframes from dom.
     * @example
     *
     *  paymentForm.destroy((result) => {
     *    // ...
     *  });
     */
    destroy(cb: ConsumerFn<{
        frames: IFrameStatus[];
        message: string;
    }>): void;
    /**
     * @description gets data on form validation state
     * @example
     *
     *  paymentForm.getState((formValidity) => {
     *    // ...
     *  });
     */
    getState(cb: ConsumerFn<FormValidity>): void;
    isValid(): boolean;
    /**
     * @description validates form
     * @example
     *
     *  paymentForm.validate((validationResult) => {
     *    if (validationResult.error) {
     *      throw new Error("form not valid");
     *    } else {
     *      // ...
     *    }
     *  });
     */
    validate(cb: ConsumerFn<ValidationResult>): void;
    /**
     * @description custom user events
     * @example
     *
     *  paymentForm.on("cardType", (res) => {
     *    // ...
     *  });
     */
    on(type: CustomEventName, callback: FieldEventHandlerCallback): void;
    /**
     * @description resets payment field state and css behavioral classes.
     * @example
     *
     *  paymentForm.reset((result) => {
     *    // ...
     *  });
     */
    reset(cb: ConsumerFn<IMessage>): void;
    /**
     * @description submit card field values to PaymentJSv2 api for tokenization
     * @example
     *
     *  paymentForm.tokenize((result) => {
     *    // ...
     *  });
     */
    tokenize(cb: ConsumerFn<TokenizeResult>): void;
}
export {};
