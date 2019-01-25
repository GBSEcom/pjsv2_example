import cookieParser from 'cookie-parser';
import express from 'express';
import {Application} from 'express';
import * as http from 'http';
import logger from 'morgan';
import { getRouter } from './routes';

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

export function makeServer() {
  const app: Application = express();
  const port = normalizePort(process.env.PORT || '3000');

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use('/public', express.static("build/public"));
  app.use('/favicon.ico', express.static('build/public/favicon.ico'));

  app.use("/", getRouter());

  // error handler
  app.use(function(err: any, req: any, res: any, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500).end();
  });

  app.set('port', port);

  const server = http.createServer(app);
  server.on('error', (error: Error) => {
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

  });
  return () => server.listen(port, () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
  });
}

export function startServer() {
  makeServer()();
}

