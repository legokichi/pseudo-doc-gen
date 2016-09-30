/// <reference path="../typings/index.d.ts" />

import * as fs from "mz/fs";
import * as express from 'express';
import * as http from 'http';
import * as morgan from 'morgan'; // express logger
import * as ejs from 'ejs'; // template engine

import * as code_generator from "./code_generator";

// サーバ設定

const app    = express();
const server = http.Server(app);
const router = express.Router();

app.engine('ejs', ejs.renderFile);
app.use(morgan("combined", { immediate: true })); // :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
app.use('/', express.static('htdocs'));
app.use('/', router);


Promise.all([
  code_generator.ready(),
]).then(([code_gen])=>{
  router.get('/', (req, res)=>{
    const content = code_gen();
    res.render('index.ejs', { content });
  });

  server.listen(8080);
  console.log("server start");
});
