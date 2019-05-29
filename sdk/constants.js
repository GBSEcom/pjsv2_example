"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServiceUrl;
(function (ServiceUrl) {
    ServiceUrl["STG"] = "https://int.api.firstdata.com/paymentjs/v2";
    ServiceUrl["QA"] = "https://qa.api.firstdata.com/paymentjs/v2";
    ServiceUrl["UAT"] = "https://cert.api.firstdata.com/paymentjs/v2";
    ServiceUrl["PROD"] = "https://prod.api.firstdata.com/paymentjs/v2";
})(ServiceUrl = exports.ServiceUrl || (exports.ServiceUrl = {}));
var GatewayName;
(function (GatewayName) {
    GatewayName["BLUEPAY"] = "BLUEPAY";
    GatewayName["CARD_CONNECT"] = "CARD_CONNECT";
    GatewayName["IPG"] = "IPG";
    GatewayName["PAYEEZY"] = "PAYEEZY";
})(GatewayName = exports.GatewayName || (exports.GatewayName = {}));
var CustomEventName;
(function (CustomEventName) {
    CustomEventName["BLUR"] = "blur";
    CustomEventName["CARD_TYPE"] = "cardType";
    CustomEventName["CHANGE"] = "change";
    CustomEventName["FOCUS"] = "focus";
})(CustomEventName = exports.CustomEventName || (exports.CustomEventName = {}));
var FieldName;
(function (FieldName) {
    FieldName["NAME"] = "name";
    FieldName["CARD"] = "card";
    FieldName["CVV"] = "cvv";
    FieldName["EXP"] = "exp";
})(FieldName = exports.FieldName || (exports.FieldName = {}));
var EnvName;
(function (EnvName) {
    EnvName["STG"] = "stg";
    EnvName["QA"] = "qa";
    EnvName["UAT"] = "uat";
    EnvName["PROD"] = "prod";
})(EnvName = exports.EnvName || (exports.EnvName = {}));
