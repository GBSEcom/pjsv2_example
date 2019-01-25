import { CustomEvents, FieldName, GatewayEnum } from "./constants";
export declare type ConsumerFn<T> = (data: T) => void;
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
}
export interface IBluepayCredentials {
    readonly gateway: GatewayEnum.BLUEPAY;
    readonly accountId: string;
    readonly secretKey: string;
    readonly zeroDollarAuth: boolean;
}
export interface ICardConnectCredentials {
    readonly gateway: GatewayEnum.CARD_CONNECT;
    readonly merchantId: string;
    readonly apiUserAndPass: string;
    readonly zeroDollarAuth: boolean;
}
export interface IIPGCredentials {
    readonly gateway: GatewayEnum.IPG;
    readonly apiKey: string;
    readonly apiSecret: string;
    readonly zeroDollarAuth: boolean;
}
export interface IPayeezyCredentials {
    readonly gateway: GatewayEnum.PAYEEZY;
    readonly apiKey: string;
    readonly apiSecret: string;
    readonly authToken: string;
    readonly transarmorToken?: string;
    readonly zeroDollarAuth: string;
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
     * @function destroy
     * @memberof window.firstdata.paymentFields
     * @description removes iframes from dom.
     * @returns {promise}
     * @example
     *
     *  window.firstdata.paymentFields
     *    .destroy().then((res)=> console.log(res));
     */
    destroy(cb: ConsumerFn<{
        frames: IFrameStatus[];
        message: string;
    }>): void;
    /**
     * @function getState
     * @memberof window.firstdata.paymentFields
     * @returns {promise}
     * @example
     *
     *  window.firstdata.paymentFields.getState().then((res) => {
     *      console.log(res);
     *    });
     */
    getState(cb: ConsumerFn<FormValidity>): void;
    isValid(): boolean;
    /**
     * @function validate
     * @memberof window.firstdata.paymentFields
     * @returns {promise}
     * @example
     *
     *  window.firstdata.paymentFields
     *    .validate()
     *    .then((res) => {
     *      if (res.error) {
     *        throw new Error("form not valid");
     *      } else {
     *        return res;
     *      }
     *    })
     */
    validate(cb: ConsumerFn<ValidationResult>): void;
    /**
     * @function on
     * @description custom user events
     * @memberof window.firstdata.paymentFields
     * @param {string} type focus|blur|change|cardType
     * @param {callback} callback
     * @example
     *
     *  window.firstdata.paymentFields.on("cardType", (res) => {
     *    console.log(res.brandNiceType);
     *  });
     */
    on(type: CustomEvents, callback: FieldEventHandlerCallback): void;
    /**
     * @function reset
     * @memberof window.firstdata.paymentFields
     * @description resets payment field state and css behavioral classes.
     * @returns {promise}
     * @example
     *
     *  window.firstdata.paymentFields.reset().then((res) => {
     *    console.log(res);
     *  });
     */
    reset(cb: ConsumerFn<IMessage>): void;
    /**
     * @function client
     * @memberof window.firstdata.paymentFields
     * @returns {promise}
     * @example
     *
     *  window.firstdata.paymentFields
     *    .client(clientToken).then((res)=> console.log(res));
     */
    tokenize(cb: ConsumerFn<TokenizeResult>): void;
}
export {};
