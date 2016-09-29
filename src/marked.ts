/// <reference path="../typings/index.d.ts" />

const marked = require("marked");

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

export {marked};
