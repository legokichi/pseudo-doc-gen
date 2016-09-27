const fs         = require("fs");
const http       = require('http');

const express    = require('express');
const morgan     = require('morgan'); // express logger
const ejs        = require('ejs');
const marked     = require("marked");

const app = express();
const server = http.Server(app);

app.engine('ejs', ejs.renderFile);
app.use(morgan("combined", { immediate: true })); // :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  smartypants: false
});

const api_router = express.Router();
api_router.get('/', (req, res)=>{
  Promise.all([
    fs.readdirAsync("htdocs/image"),
    fs.readFileAsync("htdocs/handwriting/index.md", {encoding: "utf8"})
  ])
  .then(([imgs, text])=>{
    imgs.forEach((img)=>{ text = text + "<img data-label='photo' src='/image/"+img+"' style='float:right;'/>" + text; });
    text = "<span data-label='handwriting'>" + text + "</span>";
    const html = marked(text);
    res.render('index.ejs', {
  		content: html
  	});
  }).catch((err)=>{
    res.send(err)
  });
});


app.use('/', express.static('htdocs'));
app.use('/', api_router);

server.listen(8080);


fs.readdirAsync = asynchronous(fs.readdir, fs);
fs.readFileAsync = asynchronous(fs.readFile, fs);
fs.lstatAsync = asynchronous(fs.lstat, fs);

function asynchronous(fn, ctx){
  return function _asyncFn(){
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function(resolve, reject){
      fn.apply(ctx, args.concat(function(err, val){
        if(err){
          reject(err);
        }else{
          resolve(val);
        }
      }));
    });
  };
}

function ls(pathname){
  return fs.readdirAsync(pathname)
  .then(function(names){
    return Promise.all(
      names.map(function(name){
        return fs.lstatAsync(path.join(pathname, name))
        .then(function(stat){
          return {name: name, stat: stat};
        });
      })
    )
  });
}
