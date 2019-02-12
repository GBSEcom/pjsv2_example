import { ServiceUrl } from "./constants";
import { BiConsumerFn, IAuthorizeSessionRequest, ICardData, IMerchantClient, ISessionAuth } from "./types";
export declare class MerchantClient implements IMerchantClient {
    private readonly baseServiceUrl;
    private readonly logger?;
    constructor(baseServiceUrl: ServiceUrl, logger?: BiConsumerFn<string, string> | undefined);
    authorizeSession(reqData: IAuthorizeSessionRequest): Promise<ISessionAuth>;
    tokenizeCard(auth: ISessionAuth, data: ICardData): Promise<boolean>;
    private log;
    private encodeCardData;
    private encrypt;
    private sendRequest;
    private handleRequestError;
}
