import cors from "cors";
import { Request, Response, Router } from "express";
import * as path from "path";
import { GatewayEnum } from "../../sdk/constants";
import { ISessionAuth } from "../../sdk/types";
import { Context, EnvName } from "./context";

const responseCache = new Map<string, object>();
const requestCache = new Map<string, true>();

const writeLog = (msg: string) => console.log(msg);

const getHomePageFn = (env: string) => {
  return (req: Request, res: Response) => res.sendFile(path.resolve(`./build/public/index.${env}.html`));
};

const clearCache = (req: Request, res: Response) => {
  responseCache.clear();
  requestCache.clear();
  res.status(200);
  res.send();
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

const checkTokenizeStatusEndpoint = (req: Request, res: Response) => {
  const clientToken = req.params.clientToken;
  if (responseCache.has(clientToken)) {
    res.json({ message: "Token received by webhook.", status: 1 });
  } else if (requestCache.has(clientToken)) {
    res.json({
      error: true,
      message: "Token not received by webhook.",
      status: 0,
    });
  } else {
    res.json({
      error: true,
      message: "Unrecognized clientToken. The authorize-client request may not have taken place",
      status: 0,
    });
  }
};

const authorizeClient = (env: EnvName, gateway: GatewayEnum, zeroDollarAuth: boolean): Promise<ISessionAuth> => {
  try {
    const context: Context = Context.for(env);
    return context.client.authorizeSession({
      apiKey: context.apiKey,
      apiSecret: context.apiSecret,
      gatewayConfig: {
        ...context.getGatewayCreds(gateway),
        zeroDollarAuth,
      },
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

const authorizeClientEndpoint = (req: Request, res: Response) => {
  authorizeClient(req.body.env, req.body.gateway, req.body.zeroDollarAuth)
    .then((data: ISessionAuth) => {
      requestCache.set(data.clientToken, true);
      res.json(data);
    })
    .catch((err: any) => {
      writeLog(`authorizeClient/FATAL - ${err.message||"EMPTY_ERROR"}`);
      res.status(500).json({
        error: "Failed to authorize session",
      });
    });
};

const tokenizeWebhookEndpoint = (req: Request, res: Response) => {
  responseCache.set(req.header("Client-Token") as string, req.body);
  res.status(200);
  res.send();
  writeLog(req.body);
};

export const getRouter = () => {
  const router: Router = Router();
  router.get("/uat", getHomePageFn("uat"));
  router.get("/prod", getHomePageFn("prod"));
  router.get("/api/clear-cache", clearCache);
  router.get("/api/responses/:clientToken", getTokenizeResponse);
  router.post("/api/tokenize-webhook", tokenizeWebhookEndpoint);

  router.options("/api/authorize-client", cors);
  router.post("/api/authorize-client", cors, authorizeClientEndpoint);

  router.options("/api/tokenize-status/:clientToken", cors);
  router.get("/api/tokenize-status/:clientToken", cors, checkTokenizeStatusEndpoint);

  return router;
};
