/// <reference path="../typings/index.d.ts" />

import * as fs from "mz/fs";
import * as express from 'express';
import * as http from 'http';
import * as morgan from 'morgan'; // express logger
import * as ejs from 'ejs'; // template engine

import {marked} from "./marked";
import * as md_generator from "./markdown-generator";
import * as style_generator from "./style-generator";
// サーバ設定

const app    = express();
const server = http.Server(app);
const router = express.Router();

app.engine('ejs', ejs.renderFile);
app.use(morgan("combined", { immediate: true })); // :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
app.use('/', express.static('htdocs'));
app.use('/', router);


Promise.all([
  style_generator.ready(),
  md_generator.ready()     // 文書構造捏造器
]).then(([less_gen, md_gen])=>{
  router.get('/', (req, res)=>{
    const html = marked(md_gen());
    const less = less_gen();
    res.render('index.ejs', { content: html, less: less });
  });

  server.listen(8080);
  console.log("server start");
});
