"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
exports.ApiEndpoints = {
    LOCAL: 'https://local.paymentjs.firstdata.com:4431',
    DEV: 'https://dev.paymentjs.firstdata.com',
    STG: 'https://stg.paymentjs.firstdata.com',
    TEST: 'https://test.paymentjs.firstdata.com',
    CERT: 'https://cert.paymentjs.firstdata.com',
    PROD: 'https://prod.paymentjs.firstdata.com',
};
class ApiClient {
    static get LOCAL() {
        return new ApiClient(exports.ApiEndpoints.LOCAL);
    }
    static get DEV() {
        return new ApiClient(exports.ApiEndpoints.DEV);
    }
    static get STG() {
        return new ApiClient(exports.ApiEndpoints.STG);
    }
    static get TEST() {
        return new ApiClient(exports.ApiEndpoints.TEST);
    }
    static get CERT() {
        return new ApiClient(exports.ApiEndpoints.CERT);
    }
    static get PROD() {
        return new ApiClient(exports.ApiEndpoints.PROD);
    }
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    checkConnection() {
        return axios_1.default.request({
            headers: {
                "Accept": "application/json",
            },
            url: `${this.baseUrl}/status/online`,
            method: "get"
        }).then(response => 200 === response.status, () => false);
    }
    authorizeClient(request) {
        const onSuccess = (response) => {
            if (response.data.status === 1) {
                return { status: 1, clientToken: response.data.clientToken };
            }
            return { status: 0, reason: response.data.reason };
        };
        const onError = (error) => {
            if (error.response == null) {
                return { status: 0, reason: "No response from server." };
            }
            return { status: 0, reason: error.response.data.reason };
        };
        return axios_1.default.request({
            headers: {
                "Content-Type": "application/json"
            },
            url: `${this.baseUrl}/merchant/authorize-client`,
            method: "post",
            data: request
        }).then(onSuccess, onError);
    }
    getSettings() {
        return axios_1.default.request({
            headers: {
                "Accept": "application/json",
            },
            url: `${this.baseUrl}/merchant/velocity/settings`,
            method: "get",
        }).then(response => response.data, () => undefined);
    }
    updateSettings(credentials, settings) {
        return new Promise((resolve, reject) => {
            axios_1.default.request({
                headers: {
                    "Content-Type": "application/json",
                },
                url: `${this.baseUrl}/merchant/velocity/settings`,
                method: "post",
                data: { credentials, settings },
            }).then(() => resolve(true), (error) => {
                if (error.response == null) {
                    reject(new Error("server did not respond to settings update request"));
                }
                else if (error.response.data != null && error.response.data.error != null) {
                    reject(new Error(`error response from server during settings update: ${error.response.data.error}`));
                }
                else {
                    reject(new Error("error occurred during settings update but response was not in expected format"));
                }
            });
        });
    }
    getVelocityStatus() {
        return axios_1.default.request({
            headers: {
                "Accept": "application/json",
            },
            url: `${this.baseUrl}/merchant/velocity/status`,
            method: "get"
        }).then(response => {
            if (response.data != null && response.data.status != null) {
                return response.data.status;
            }
            else {
                return "UNKNOWN (unexpected server response)";
            }
        }, () => {
            return "UNKNOWN (error occurred during request)";
        });
    }
    getDebugInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const pjsServerStatusPromise = this.checkConnection();
            const velocitySettingsPromise = this.getSettings();
            const velocityStatusPromise = this.getVelocityStatus();
            return {
                pjsServerStatus: yield pjsServerStatusPromise,
                velocitySettings: yield velocitySettingsPromise,
                velocityStatus: yield velocityStatusPromise,
            };
        });
    }
}
exports.ApiClient = ApiClient;
