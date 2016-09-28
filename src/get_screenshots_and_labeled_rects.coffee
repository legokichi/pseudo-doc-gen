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
  width: 1200*2,
  height: 1600*2
i = 0
page.onLoadFinished = ->
  console.log "======= A ======="
  page.evaluate ->
    Array.prototype.slice.call(document.querySelectorAll('[data-label]'))
    .forEach (elm)->
      $elm = $(elm)
      o = $elm.offset()
      {top, left, width, height} = {top:o.top, left:o.left, width: $elm.width(), height: $elm.height()}
      div = document.createElement("div");
      div.style.display = "inline-block";
      div.style.position = "absolute";
      div.style.top = top + "px";
      div.style.left = left + "px";
      div.style.width = width + "px";
      div.style.height = height + "px";
      div.style.border = "1px solid black";
      document.body.appendChild(div);

  console.log "======= B ======="
  labeled_rects = page.evaluate ->
    elm2$elm = (fn)-> (elm, i)-> fn($(elm), i)
    {
      text:        Array::slice.call(document.querySelectorAll('[data-label="text"]'       )).map elm2$elm ($elm)-> o = $elm.offset(); {top:o.top, left:o.left, width: $elm.width(), height: $elm.height()}
      handwriting: Array::slice.call(document.querySelectorAll('[data-label="handwriting"]')).map elm2$elm ($elm)-> o = $elm.offset(); {top:o.top, left:o.left, width: $elm.width(), height: $elm.height()}
      photo:       Array::slice.call(document.querySelectorAll('[data-label="photo"]'      )).map elm2$elm ($elm)-> o = $elm.offset(); {top:o.top, left:o.left, width: $elm.width(), height: $elm.height()}
    }
  console.log json = JSON.stringify(labeled_rects, null, "  ")
  prefix = OUTPUT_DIR + Date.now()
  page.render(prefix + '_screenshot.png')
  fs.write(prefix + "_rect.json", json)
  if(i++ > 100)
    console.log "end"
    phantom.exit()
  else
    console.log "reload"
    page.open 'http://localhost:8080/'


page.open 'http://localhost:8080/'
console.log "======= _ ======="
