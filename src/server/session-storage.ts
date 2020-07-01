
export interface ISessionStorage {
  clearAll(): void;
  hasResponse(clientToken: string): boolean;
  hasRequest(clientToken: string): boolean;
  getResponse(clientToken: string): object|undefined;
  setResponse(clientToken: string, data: object): void;
  setRequest(clientToken: string, nonce: string): void;
  checkNonce(clientToken: string, nonce: string): boolean;
}

export const SessionStorage = (): ISessionStorage => {
  const responses = new Map<string, object>();
  const requests = new Map<string, true>();
  const nonces = new Map<string, string>();

  return {
    clearAll: () => {
      responses.clear();
      requests.clear();
      nonces.clear();
    },

    hasResponse: (clientToken: string) => responses.has(clientToken),

    hasRequest: (clientToken: string) => requests.has(clientToken),

    getResponse: (clientToken: string): object|undefined => {
      const response = responses.get(clientToken);
      responses.delete(clientToken);
      requests.delete(clientToken);
      nonces.delete(clientToken);
      return response;
    },

    setResponse: (clientToken: string, data: object) => {
      responses.set(clientToken, data);
    },

    setRequest: (clientToken: string, nonce: string) => {
      requests.set(clientToken, true);
      nonces.set(clientToken, nonce);
    },

    checkNonce: (clientToken: string, nonce: string) =>
      nonces.has(clientToken) && nonce === nonces.get(clientToken),
  };
};

