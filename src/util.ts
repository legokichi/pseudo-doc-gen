/// <reference path="../typings/index.d.ts" />

import * as fs from "mz/fs";
const path = require("path");


export function ls(pathname: string): Promise<{name: string, stat: fs.Stats}[]> {
  return fs.readdir(pathname)
  .then((names)=>{
    return Promise.all(
      names.map((name)=>{
        return fs.lstat(path.join(pathname, name))
        .then((stat)=>{
          return {name: name, stat: stat};
        });
      })
    )
  });
}

export function choice<T>(arr: T[]): T {
  return arr[(Math.random()*100*(arr.length)|0)%arr.length];
}