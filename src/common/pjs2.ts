export const enum ServiceUrl {
  UAT = "https://cert.api.firstdata.com/paymentjs/v2",
  PROD = "https://prod.api.firstdata.com/paymentjs/v2"
}

export const enum GatewayName {
  BLUEPAY = "BLUEPAY",
  CARD_CONNECT = "CARD_CONNECT",
  IPG = "IPG",
  PAYEEZY = "PAYEEZY"
}

export const enum CustomEventName {
  BLUR = "blur",
  CARD_TYPE = "cardType",
  CHANGE = "change",
  FOCUS = "focus"
}

export const enum FieldName {
  NAME = "name",
  CARD = "card",
  CVV = "cvv",
  EXP = "exp",
  COMPANY = "company",
  ADDRESS1 = "address1",
  ADDRESS2 = "address2",
  CITY = "city",
  REGION = "region",
  COUNTRY = "country",
  POSTAL_CODE ="postalCode",
}

export const enum EnvName {
  UAT = "uat",
  PROD = "prod"
}

export type Consumer<T> = (data: T) => void;

export type Callback = () => void;

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
  [FieldName.CARD]: IField;
  [FieldName.CVV]?: IField;
  [FieldName.EXP]: IField;
  [FieldName.NAME]: IField;
  [FieldName.COMPANY]?: IField;
  [FieldName.ADDRESS1]?: IField;
  [FieldName.ADDRESS2]?: IField;
  [FieldName.CITY]?: IField;
  [FieldName.REGION]?: IField;
  [FieldName.COUNTRY]?: IField;
  [FieldName.POSTAL_CODE]?: IField;
}

export interface IAddressData {
  [FieldName.COMPANY]?: string;
  [FieldName.ADDRESS1]?: string;
  [FieldName.ADDRESS2]?: string;
  [FieldName.CITY]?: string;
  [FieldName.REGION]?: string;
  [FieldName.COUNTRY]?: string;
  [FieldName.POSTAL_CODE]?: string;
}

export interface IStateConfig {
  form?: {
    selector: string;
  };
  fields: IFields;
  classes?: ICssClassList;
  styles?: ICssStyleList;
}

export interface ISessionAuth {
  clientToken: string;
  publicKeyBase64: string;
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
  readonly storeId: string;
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

export type GatewayCredentials = IBluepayCredentials | ICardConnectCredentials | IPayeezyCredentials | IIPGCredentials;

export interface IAuthorizeSessionRequest {
  gatewayConfig: GatewayCredentials;
  apiSecret: string;
  apiKey: string;
  nonce?: string | number;
  timestamp?: number;
  msgSignature?: string;
}

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

export interface ICvvFieldValidity extends IFieldValidity<FieldName.CVV> {
  maxLength: number;
}

export type FormValidity = {
  [F in FieldName]: IFieldValidity<F>;
} & {
  card: ICardFieldValidity;
  cvv: ICvvFieldValidity;
};

export interface ITokenizeSuccess extends ISuccessResult {
  clientToken: string;
}

export type TokenizeResult = ITokenizeSuccess | IFailureResult;

export type FieldEventHandlerCallback = Consumer<{ field: string, selector: string } | {
  brand: string;
  brandNiceType: string;
  code: string | {};
  field: FieldName.CARD;
  potentiallyValid: boolean;
  selector: string;
  valid: boolean;
}>

export interface IPaymentFormHooks {
  preFlowHook: Consumer<Consumer<ISessionAuth>>;
  submitFormHook?: Consumer<Consumer<IAddressData>>;
}

export interface IPaymentForm {
  /**
   * @deprecated
   */
  tokenize(callback: Consumer<TokenizeResult>): void;

  onSubmit(resolve: Consumer<string>, reject?: Consumer<Error>): void;
  createFields(resolve: Callback, reject?: Consumer<Error>): void;
  reset(resolve: Callback, reject?: Consumer<Error>): void;
  destroyFields(resolve: Callback, reject?: Consumer<Error>): void;
  validate(resolve: Callback, reject?: Consumer<Error>): void;
  authenticate(resolve: Consumer<ISessionAuth>, reject?: Consumer<Error>): void;
  submit(auth: ISessionAuth, resolve: Consumer<string>, reject?: Consumer<Error>): void;
  isSupported(): boolean;
  isValid(): boolean;
  getState(cb: Consumer<FormValidity>): void;
  on(type: CustomEventName, callback: FieldEventHandlerCallback): void

  // NOT YET RELEASED
  //setFieldFocus(field: FieldName, resolve: Callback, reject?: Consumer<Error>): void;
}
