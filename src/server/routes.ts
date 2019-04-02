import * as path from 'path';
import { Request, Response, Router } from 'express';
import { Context } from './context';
import { ISessionAuth } from '../../sdk/types';
import { EnvName, GatewayName } from '../../sdk/constants';

const responseCache = new Map<string, object>();
const requestCache = new Map<string, true>();
const nonceCache = new Map<string, string>();

const genNonce = () =>
  `${(new Date().getTime() + Math.random())}`;

const getHomePageFn = (env: EnvName) => {
  return (req: Request, res: Response) => res.sendFile(path.resolve(`./build/public/index.${env}.html`));
};

const getHealth = (req: Request, res: Response) => {
  res.status(200);
  res.send("OK");
};

const clearCacheEntry = (clientToken: string) => {
  responseCache.delete(clientToken);
  requestCache.delete(clientToken);
  //nonceCache.delete(clientToken); <- handled in webhook
};

const clearCache = (req: Request, res: Response) => {
  responseCache.clear();
  requestCache.clear();
  nonceCache.clear();
  res.status(200);
  res.send();
};

const getTokenizeResponse = (req: Request, res: Response) => {
  const clientToken = req.params.clientToken;
  if (responseCache.has(clientToken)) {
    res.status(200);
    res.send(JSON.stringify({ response: responseCache.get(clientToken) }, null, 2));
    clearCacheEntry(clientToken);
  } else if (requestCache.has(clientToken)) {
    res.json({ error: `No response found for clientToken "${clientToken}"` });
  } else {
    res.json({ error: `Unrecognized clientToken "${clientToken}"` });
  }
};

const checkTokenizeStatusEndpoint = (req: Request, res: Response) => {
  const clientToken = req.params.clientToken;
  if (responseCache.has(clientToken)) {
    res.json({ error: false });
  } else if (requestCache.has(clientToken)) {
    res.json({
      error: true,
      reason: 'Token not received by webhook.',
    });
  } else {
    res.json({
      error: true,
      reason: 'Unrecognized clientToken. The authorize-client request may not have taken place',
    });
  }
};

const authorizeClient = (env: EnvName, gateway: GatewayName, zeroDollarAuth: boolean, nonce?: string): Promise<ISessionAuth> => {
  try {
    const context: Context = Context.for(env);
    return context.client.authorizeSession({
      apiKey: context.apiKey,
      apiSecret: context.apiSecret,
      gatewayConfig: {
        ...context.getGatewayCreds(gateway),
        zeroDollarAuth,
      },
      nonce,
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

const authorizeClientEndpoint = (req: Request, res: Response) => {
  const nonce = genNonce();
  authorizeClient(req.body.env, req.body.gateway, req.body.zeroDollarAuth, nonce)
    .then((data: ISessionAuth) => {
      requestCache.set(data.clientToken, true);
      nonceCache.set(data.clientToken, nonce);
      res.json(data);
    })
    .catch((err: any) => {
      console.log(`authorizeClient/FATAL - ${err.message||"EMPTY_ERROR"}`);
      res.status(500).json({
        error: true,
        reason: "Failed to authorize session",
      });
    });
};

const tokenizeWebhook = (clientToken: string, body: any) => {
  responseCache.set(clientToken, body);
};

const tokenizeWebhookEndpoint = (req: Request, res: Response) => {
  const clientToken = req.header("Client-Token") as string;
  const nonce = req.header("Nonce") as string;
  if (nonceCache.has(clientToken) && nonce === nonceCache.get(clientToken)) {
    nonceCache.delete(clientToken);
    tokenizeWebhook(clientToken, req.body);
    res.status(200);
    res.send();
    console.log(JSON.stringify({
      clientToken: clientToken,
      nonce: req.header("Nonce"),
      body: req.body,
    }, null, 2));
  } else {
    res.status(403);
    res.send();
  }
};

export const getRouter = () => {
  const router: Router = Router();
  router.get(`/${EnvName.UAT}`, getHomePageFn(EnvName.UAT));
  router.get(`/${EnvName.PROD}`, getHomePageFn(EnvName.PROD));
  router.get("/api/clear-cache", clearCache);
  router.get('/api/responses/:clientToken', getTokenizeResponse);
  router.post("/api/tokenize-webhook", tokenizeWebhookEndpoint);
  router.post("/api/authorize-client", authorizeClientEndpoint);
  router.get("/api/tokenize-status/:clientToken", checkTokenizeStatusEndpoint);

  return router;
};

