"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const crypto_1 = require("crypto");
const signMsg = (secret, msg) => crypto_1.createHmac("sha256", secret)
    .update(msg)
    .digest("base64");
class MerchantClient {
    constructor(baseServiceUrl, logger) {
        this.baseServiceUrl = baseServiceUrl;
        this.logger = logger;
    }
    authorizeSession(reqData) {
        this.log("debug", "entering authorizeSession");
        const nonce = reqData.nonce || (new Date().getTime() + Math.random());
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
        this.log("debug", "making request");
        try {
            return axios_1.default.request(httpParams)
                .then((response) => {
                this.log("debug", "received response");
                if (!response.data || !response.data.publicKeyBase64 || !response.headers["client-token"]) {
                    this.log("error", {
                        data: response.data,
                        headers: response.headers,
                    });
                    return Promise.reject(new Error("did not receive expected data from pjs2 server"));
                }
                const publicKeyBase64 = response.data.publicKeyBase64;
                const clientToken = response.headers["client-token"]; // lowercase per Axios docs
                return Promise.resolve({ clientToken, publicKeyBase64 });
            })
                .catch((err) => {
                this.log("error", err.message);
                return Promise.reject(err);
            });
        }
        catch (err) {
            this.log("error", err.message);
            return Promise.reject(err);
        }
    }
    log(level, data) {
        if (this.logger) {
            this.logger(level, JSON.stringify(data));
        }
    }
}
exports.MerchantClient = MerchantClient;
