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
api_router.get('/', (req, res)=>{
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
    const text = texts.reduce((all, text)=> all+text);
    const lines = _.shuffle(text.split("\n"));
    //const tagged_text = lines.map((line)=> "<span data-label='text' style='width: "+ (50+Math.random()*110|0) +"mm;'>" + line + "</span>");
    const tagged_text = [];
    for(let i=0; i<lines.length; i++){
      let str = "";
      for(; i<lines.length; i++){
        let line = lines[i];
        str += line;
        if(Math.random()>0.99){
          break;
        }
        tagged_text.push("<span data-label='text' style='width: "+ (50+Math.random()*110|0) +"mm;'>" + str + "</span>");
      }
    }
    const tagged_handwritings = handwriting_names.map((img)=> "<div data-label='handwriting' style='height:"+ (100+Math.random()*100|0) +"mm; overflow:hidden'><img src='/handwriting/" + img + "' /></div>");
    const tagged_imgs = img_names.map((img)=> "<img data-label='photo' src='/image/" + img + "' />");
    const merged = tagged_text.slice(0, 6).reduce((str, line)=>{
      const rand = Math.random();
      if(rand>0.5){
        str += line + (tagged_imgs.length > 0 ? tagged_imgs.pop() : "");
      }else{
        str += line + (tagged_handwritings.length > 0 ? tagged_handwritings.pop() : "");
      }
      return str;
    }, "");
    const html = marked(text);
    res.render('index.ejs', {
  		content: merged
  	});
  }).catch((err)=>{
    console.log(err);
    res.send(err);
  });
});


app.use('/', express.static('htdocs'));
app.use('/', api_router);

server.listen(8080);
