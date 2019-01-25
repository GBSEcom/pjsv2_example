"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServiceUrls;
(function (ServiceUrls) {
    ServiceUrls["STG"] = "https://dev.api.firstdata.com/paymentjs/v2";
    ServiceUrls["QA"] = "https://qa.api.firstdata.com/paymentjs/v2";
})(ServiceUrls = exports.ServiceUrls || (exports.ServiceUrls = {}));
var GatewayEnum;
(function (GatewayEnum) {
    GatewayEnum["BLUEPAY"] = "BLUEPAY";
    GatewayEnum["CARD_CONNECT"] = "CARD_CONNECT";
    GatewayEnum["IPG"] = "IPG";
    GatewayEnum["PAYEEZY"] = "PAYEEZY";
})(GatewayEnum = exports.GatewayEnum || (exports.GatewayEnum = {}));
var CustomEvents;
(function (CustomEvents) {
    CustomEvents["BLUR"] = "blur";
    CustomEvents["CARD_TYPE"] = "cardType";
    CustomEvents["CHANGE"] = "change";
    CustomEvents["FOCUS"] = "focus";
})(CustomEvents = exports.CustomEvents || (exports.CustomEvents = {}));
var FieldName;
(function (FieldName) {
    FieldName["NAME"] = "name";
    FieldName["CARD"] = "card";
    FieldName["CVV"] = "cvv";
    FieldName["EXP"] = "exp";
})(FieldName = exports.FieldName || (exports.FieldName = {}));
