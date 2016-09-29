const fs         = require("fs");
const http       = require('http');

const express    = require('express');
const morgan     = require('morgan'); // express logger
const ejs        = require('ejs');
const marked     = require("marked");
const _          = require("underscore")

// 非同期FS_API定義
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

fs.readdirAsync = asynchronous(fs.readdir, fs);
fs.readFileAsync = asynchronous(fs.readFile, fs);
fs.lstatAsync = asynchronous(fs.lstat, fs);

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


// サーバ設定

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
Promise.all([
  fs.readdirAsync("htdocs/image"),
  fs.readdirAsync("htdocs/chars"),
  fs.readdirAsync("htdocs/handwriting"),
  fs.readdirAsync("htdocs/text")
])
.then(([img_names, chars_names, handwriting_names, text_names])=>{
  const prms = text_names.map((name)=> fs.readFileAsync("htdocs/text/"+ name, {encoding: "utf8"}) )
  return Promise.all(prms).then((texts)=>{
    return {img_names:_.shuffle(img_names), chars_names:_.shuffle(chars_names), handwriting_names, texts};
  });
})
.then(({img_names, chars_names, handwriting_names, texts})=>{
  api_router.get('/', (req, res)=>{
    const text = texts.reduce((all, text)=> all+text);
    const lines = _.shuffle(text.split("\n"));
    function gen(length){
      const rand = Math.random();
      const ranb = Math.random();
      const ccount = rand < 1/3 ? 1
                   : rand < 2/3 ? 2
                   :              3
      const width = ranb < 1/3 ? 30
                  : ranb < 2/3 ? 60
                  :              90
      return `
      width: ${width}%;
      column-count: ${ccount};
      `;
    }
    const tagged_text = [];
    for(let i=0; i<lines.length; i++){
      let str = "";
      for(; i<lines.length; i++){
        let line = lines[i];
        str += line;
        if(Math.random()>0.95){
          break;
        }
      }
      tagged_text.push("<span data-label='text' style='"+gen(str.length)+"'>" + str + "</span>");
    }
    const tagged_handwritings = handwriting_names.map((img)=> "<img data-label='handwriting' src='/handwriting/" + img + "' />");
    const tagged_imgs         = img_names.map(        (img)=> "<img data-label='image'       src='/image/"       + img + "' />");
    const merged = tagged_text.slice(0, 5).reduce((str, line)=>{
      //const rand = Math.random();
      str += line
      str += (tagged_imgs.length > 0 ? tagged_imgs.pop() : "");
      str += (tagged_handwritings.length > 0 ? tagged_handwritings.pop() : "");
      return str;
    }, "");
    const html = marked(text);
    res.render('index.ejs', {
  		content: merged
  	});
  });

  app.use('/', express.static('htdocs'));
  app.use('/', api_router);

  server.listen(8080);
  console.log("server start");
}).catch((err)=>{
  console.log(err);
  res.send(err);
}).then(()=>{

})
