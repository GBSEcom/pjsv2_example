import * as path from "path";
import * as http from "http";
import express from "express";
import { Request, Response, Router } from "express";
import { ISessionStorage, SessionStorage } from "./session-storage";
import { EnvName, GatewayName, ISessionAuth } from "../common/pjs2";
import { authorizeSession } from "./authorize-session";
import { IConfig } from "./config";

const sessionStorage = SessionStorage();

const genNonce = () =>
  `${(new Date().getTime() + Math.random())}`;

const getHomePageFn = (env: string) =>
  (req: Request, res: Response) =>
    res.sendFile(path.resolve(`./build/public/index.${env}.html`));

const getHealthEndpoint = (req: Request, res: Response) => {
  res.status(200).end();
};

const clearCacheEndpoint = (req: Request, res: Response) => {
  sessionStorage.clearAll();
  res.status(200).end();
};

const getTokenizeResponseEndpoint = (req: Request, res: Response) => {
  const clientToken = req.params.clientToken;
  if (sessionStorage.hasResponse(clientToken)) {
    res.status(200);
    res.send(JSON.stringify({ response: sessionStorage.getResponse(clientToken) }, null, 2));
  } else if (sessionStorage.hasRequest(clientToken)) {
    res.json({ error: `No response found for clientToken "${clientToken}"` });
  } else {
    res.json({ error: `Unrecognized clientToken "${clientToken}"` });
  }
};

const checkTokenizeStatusEndpoint = (req: Request, res: Response) => {
  const clientToken = req.params.clientToken;
  if (sessionStorage.hasResponse(clientToken)) {
    res.json({ error: false });
  } else if (sessionStorage.hasRequest(clientToken)) {
    res.json({
      error: true,
      reason: 'Token not received by webhook.',
    });
  } else {
    res.json({
      error: true,
      reason: 'Unrecognized clientToken. The authorize-session request may not have taken place',
    });
  }
};

const makeAuthorizeSessionEndpoint = (config: IConfig) =>
  (req: Request, res: Response) => {
    const nonce = genNonce();
    authorizeSession(config, req.body.env as EnvName, req.body.gateway as GatewayName, nonce)
      .then((data: ISessionAuth) => {
        sessionStorage.setRequest(data.clientToken, nonce);
        res.json(data);
      })
      .catch((err: any) => {
        console.log(`authorizeSession/FATAL - ${err.message||"EMPTY_ERROR"}`);
        res.status(500).json({
          error: true,
          reason: "Failed to authorize session",
        });
      });
  };

const cleanReqHeaders = (headers: http.IncomingHttpHeaders): http.IncomingHttpHeaders => {
  const headersCopy = { ...headers };
  headersCopy["x-real-ip"] = undefined;
  headersCopy["x-forwarded-for"] = undefined;
  headersCopy["x-forwarded-port"] = undefined;
  headersCopy["host"] = undefined;
  return headersCopy;
}

const tokenizeWebhookEndpoint = (req: Request, res: Response) => {
  const clientToken = req.header("Client-Token") as string;
  const nonce = req.header("Nonce") as string;
  if (sessionStorage.checkNonce(clientToken, nonce)) {
    sessionStorage.setResponse(clientToken, {
      headers: cleanReqHeaders(req.headers),
      body: req.body
    });
    res.status(200);
    res.send();
  } else {
    res.status(403);
    res.send();
  }
};

export const getRouter = (config: IConfig) => {
  const router = Router();

  router.use("/public", express.static("build/public"));
  router.use("/favicon.ico", express.static("build/public/favicon.ico"));

  router.get(`/uat`, getHomePageFn("uat"));
  router.get(`/prod`, getHomePageFn("prod"));

  router.get("/api/health", getHealthEndpoint);
  router.get("/api/clear-cache", clearCacheEndpoint);
  router.get('/api/responses/:clientToken', getTokenizeResponseEndpoint);
  router.post("/api/tokenize-webhook", tokenizeWebhookEndpoint);
  router.post("/api/authorize-session", makeAuthorizeSessionEndpoint(config));
  router.get("/api/tokenize-status/:clientToken", checkTokenizeStatusEndpoint);

  return router;
};

