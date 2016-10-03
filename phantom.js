var fs = require("fs");

var OUTPUT_DIR = "output/";
var page = require('webpage').create();

page.viewportSize = {
  width: 1600,
  height: 1200
};

var i = 0;

function checkReadyState(callback) {
  setTimeout(recur);
  function recur(){
    var readyState = page.evaluate(function () {
      return document.readyState;
    });
    var __loaded__ = page.evaluate(function () {
      return window.__loaded__;
    });
    console.log("checking load", readyState, __loaded__);
    if ("complete" === readyState && __loaded__ === true) {
      callback();
    } else {
      console.log("waiting load...");
      setTimeout(recur, 30);
    }
  }
}

page.onLoadFinished = function(){
  checkReadyState(onload);
};
 
function onload() {
  console.log("A");
  var labeled_rects = page.evaluate(function() {
    return getEvery();
  });
  console.log("B");
  var prefix = OUTPUT_DIR + Date.now();
  console.log(prefix, json = JSON.stringify(labeled_rects, null, "  "));
  page.render(prefix + '_screenshot.png');
  fs.write(prefix + "_rect.json", json);

  if (i++ > 33333) {
    console.log("end");
    return phantom.exit();
  } else {
    console.log("reload");
    return page.open('http://localhost:8080/');
  }
};

page.open('http://localhost:8080/');
console.log("start");

