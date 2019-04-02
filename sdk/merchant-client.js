"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const crypto = require("crypto");
const constants_1 = require("./constants");
const signMsg = (secret, msg) => crypto.createHmac("sha256", secret)
    .update(msg)
    .digest("base64");
class MerchantClient {
    constructor(baseServiceUrl, logger) {
        this.baseServiceUrl = baseServiceUrl;
        this.logger = logger;
    }
    validateNonce(nonce, response) {
        if (response.headers["nonce"]) {
            if (response.headers["nonce"] === nonce) {
                return true;
            }
            else {
                this.log("error", "nonce validation failed");
            }
        }
        else {
            this.log("error", "authorize session response missing nonce");
        }
        return false;
    }
    authorizeSession(reqData) {
        this.log("debug", "entering authorizeSession");
        const nonce = `${reqData.nonce || (new Date().getTime() + Math.random())}`;
        const timestamp = reqData.timestamp || new Date().getTime();
        const msgSignature = reqData.msgSignature
            || signMsg(reqData.apiSecret, `${reqData.apiKey}${nonce}${timestamp}${JSON.stringify(reqData.gatewayConfig)}`);
        this.log("debug", "formatting request");
        const httpParams = {
            data: reqData.gatewayConfig,
            headers: {
                "Api-Key": reqData.apiKey,
                "Content-Type": "application/json",
                "Message-Signature": msgSignature,
                "Nonce": nonce,
                "Timestamp": timestamp,
            },
            maxRedirects: 0,
            method: "post",
            url: `${this.baseServiceUrl}/merchant/authorize-session`,
        };
        return this.sendRequest(httpParams)
            .then((response) => {
            if (!response.data || !response.data.publicKeyBase64 || !response.headers["client-token"] || !this.validateNonce(nonce, response)) {
                this.log("error", {
                    data: response.data,
                    headers: response.headers,
                });
                return Promise.reject(new Error("did not receive expected data from pjs2 server"));
            }
            const publicKeyBase64 = response.data.publicKeyBase64;
            const clientToken = response.headers["client-token"]; // lowercase per Axios docs
            return Promise.resolve({ clientToken, publicKeyBase64 });
        });
    }
    log(level, data) {
        if (this.logger) {
            if (typeof data === 'string') {
                this.logger(level, data);
            }
            else {
                this.logger(level, JSON.stringify(data));
            }
        }
    }
    encodeCardData(data) {
        return [
            data[constants_1.FieldName.NAME],
            data[constants_1.FieldName.CARD].replace(/\s/g, ""),
            data[constants_1.FieldName.CVV],
            data[constants_1.FieldName.EXP].replace(/\s/g, ""),
        ].join("~");
    }
    sendRequest(config) {
        this.log("debug", "sending request");
        try {
            return axios_1.default.request(config)
                .then((response) => {
                this.log("debug", "received response");
                return response;
            })
                .catch((err) => {
                return Promise.reject(this.handleRequestError(err));
            });
        }
        catch (err) {
            return Promise.reject(this.handleRequestError(err));
        }
    }
    handleRequestError(err) {
        if (typeof err === "string") {
            this.log("error", err);
            return new Error(err);
        }
        this.log("error", err.message);
        return (err);
    }
}
exports.MerchantClient = MerchantClient;
