import cookieParser from 'cookie-parser';
import express from 'express';
import {Application} from 'express';
import * as http from 'http';
import * as https from 'https';
import logger from 'morgan';
import * as fs from "fs";
import { getRouter } from './routes';
import { Context } from './context';
import {ServerOptions} from "https";

const debug = require('debug')('firstdata:server');

function normalizePort(val: any) {
  const port2 = parseInt(val, 10);

  if (isNaN(port2)) {
    // named pipe
    return val;
  }

  if (port2 >= 0) {
    // port number
    return port2;
  }

  return false;
}

function makeServerErrorListener(port: number): (error: Error) => void {
 return (error: Error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }

  };
}

function onListen(server: http.Server|https.Server) {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function getHttpsOptions(): ServerOptions {
  const ssl = Context.getSslConfig();
  const cert: Buffer = fs.readFileSync(ssl.certPath);

  let key: Buffer;
  if (ssl.certPath === ssl.keyPath) {
    key = cert;
  } else {
    key = fs.readFileSync(ssl.keyPath);
  }

  const retVal: ServerOptions = { cert, key };
  if (ssl.passphrase != null) {
    retVal.passphrase = ssl.passphrase;
  }
  return retVal;
}

export function makeServer() {
  const app: Application = express();
  const port = normalizePort(process.env.PORT || "3000");

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use("/public", express.static("build/public"));
  app.use("/favicon.ico", express.static("build/public/favicon.ico"));

  app.use("/", getRouter());

  // error handler
  app.use(function(err: any, req: any, res: any, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  app.set("port", port);

  const server = http.createServer(app);
  const secureServer = https.createServer(getHttpsOptions(), app);

  server.on("error", makeServerErrorListener(port));
  secureServer.on("error", makeServerErrorListener(port + 1));

  return () => {
    server.listen(port, () => onListen(server));
    secureServer.listen(port + 1, () => onListen(secureServer));
  };
}

export function startServer() {
  makeServer()();
}
