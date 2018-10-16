
import * as path from 'path';
import { Request, Response, Router } from 'express';
import { Context} from './context';
import { ClientAuthRequest, ClientAuthResponse } from '../../pjs2-apiclient';

const responseCache = new Map<string, object>();
const requestCache = new Map<string, true>();

const getClientIp = (req: Request) => {
  // this header will be set by nginx
  const ip = req.header("X-Forwarded-For");
  if (ip && ip.includes(", ")) {
    return ip.split(", ")[0].trim();
  }
  return ip || "";
};

const getHomePageFn = (env: string) => {
  return (req: Request, res: Response) => res.sendFile(path.resolve(`./build/public/index.${env}.html`));
};

const getHealth = (req: Request, res: Response) => {
  res.status(200);
  res.send("OK");
};

const clearCache = (req: Request, res: Response) => {
  responseCache.clear();
  requestCache.clear();
  res.status(200);
  res.send();
};

const getDebugInfo = async (req: Request, res: Response) => {
  const context: Context = Context.for('test');
  res.json(await context.client.getDebugInfo());
};

const getTokenizeResponse = (req: Request, res: Response) => {
  const clientToken = req.params.clientToken;
  if (responseCache.has(clientToken)) {
    res.json({ response: responseCache.get(clientToken) });
  } else if (requestCache.has(clientToken)) {
    res.json({ error: `No response found for clientToken "${clientToken}"` });
  } else {
    res.json({ error: `Unrecognized clientToken "${clientToken}"` });
  }
};

const checkTokenizeStatus = (req: Request, res: Response) => {
  const clientToken = req.params.clientToken;
  if (responseCache.has(clientToken)) {
    res.json({ message: "Token received by webhook.", status: 1 });
  } else if (requestCache.has(clientToken)) {
    res.json({
      error: true,
      message: 'Token not received by webhook.',
      status: 0,
    });
  } else {
    res.json({
      error: true,
      message: 'Unrecognized clientToken. The authorize-client request may not have taken place',
      status: 0,
    });
  }
};

const authorizeClient = (req: Request, res: Response) => {

  const envName = req.body.env;
  const context: Context = Context.for(envName);

  const authRequestData: ClientAuthRequest = {
    credentials: context.getGatewayCreds(req.body.gateway),
    clientIp: getClientIp(req),
    zeroDollarAuth: req.body.zeroDollarAuth
  };
  context.client.authorizeClient(authRequestData)
    .then((response: ClientAuthResponse) => {
      if (response.status === 1) {
        requestCache.set(response.clientToken, true);
        res.json({ clientToken: response.clientToken });
      } else {
        res.json({
          error: true,
          message: response.reason,
          status: response.status,
        });
      }
  });
};

const getSettings = (req: Request, res: Response) => {
  const env: string = req.query.env || 'test';
  const context: Context = Context.for(env);
  context.client.getSettings()
    .then((data: any) => res.json(data));
};

const updateSettings = (req: Request, res: Response) => {
  const env: string = req.query.env || 'test';
  const context: Context = Context.for(env);
  let creds = { apiKey: context.apiKey, apiSecret: context.apiSecret };
  let settings = req.body;
  context.client.updateSettings(creds,settings)
    .then(() => res.json({ msg: "success" }));
};

const tokenizeWebhook = (req: Request, res: Response) => {
  const clientToken: string = req.body.clientToken;
  responseCache.set(clientToken, req.body);
  res.status(200);
  res.send();
  console.log(req.body);
};

export const getRouter = () => {
  const router: Router = Router();
  router.get("/", getHomePageFn('test'));
  router.get("/test", getHomePageFn('test'));
  router.get("/prod", getHomePageFn('prod'));
  router.get("/api/health", getHealth);
  router.get("/api/clear-cache", clearCache);
  router.get('/api/status', getDebugInfo);
  router.get('/api/responses/:clientToken', getTokenizeResponse);
  router.get("/api/tokenize-status/:clientToken", checkTokenizeStatus);
  router.post("/api/tokenize-webhook", tokenizeWebhook);
  router.post("/api/authorize-client", authorizeClient);
  router.post("/api/settings", updateSettings);
  router.get("/api/settings", getSettings);
  return router;
};

