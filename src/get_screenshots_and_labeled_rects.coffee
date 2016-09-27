`
var fs = require("fs");


// fs APIはコールバックを取るので現代的にPromiseに変換する
// function asynchronous<T, U, V>(fn: (...args: T)=> U, ctx: V): (...args: T)=> Promise<U>
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

fs.writeFileAsync = asynchronous(fs.writeFile, fs);
`

OUTPUT_DIR = "output/"

page = require('webpage').create()

page.viewportSize =
  width: 1200,
  height: 800

page.onLoadFinished = ->
  labeled_rects = page.evaluate ->
    {
      handwriting: Array::slice.call(document.querySelectorAll('[data-label="handwriting"]')).map (elm)-> elm.getBoundingClientRect()
      photo:       Array::slice.call(document.querySelectorAll('[data-label="photo"]')).map (elm)-> elm.getBoundingClientRect()
      graph:       Array::slice.call(document.querySelectorAll('[data-label="graph"]')).map (elm)-> elm.getBoundingClientRect()
      math:        Array::slice.call(document.querySelectorAll('[data-label="math"]')).map (elm)-> elm.getBoundingClientRect()
      underline:   Array::slice.call(document.querySelectorAll('[data-label="underline"]')).map (elm)-> elm.getBoundingClientRect()
    }
  console.log json = JSON.stringify(labeled_rects, null, "  ")
  prefix = OUTPUT_DIR + Date.now()
  page.render(prefix + '_screenshot.png')
  fs.write(prefix + "_rect.json", json)
  console.log "end"
  phantom.exit()

page.open 'http://localhost:8080/'
