/// <reference path="../typings/index.d.ts" />

import * as fs from "mz/fs";
const Encoding = require("encoding-japanese");
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

export function times(char: string, n: number):string{
    return n === 0 ? ""   :
           n <= 1  ? char :
                     char + times(char, n-1) ;
}

export function randTimes<T>(fn: ()=>T, threshold: number): T[]{
  let ret:T[] = [];
  while(Math.random() < threshold){
    ret.push(fn());
  }
  return ret;
}

export function decode(buffer: Buffer): string{
  return Encoding.codeToString(Encoding.convert(buffer, 'UNICODE', 'AUTO'));
}