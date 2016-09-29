const fs = require("mz/fs");

import {choice} from "./util";  

export function ready(): Promise<() => void> {
  const prms = Promise.all<string[]>([
    fs.readdir("htdocs/style")
  ]).then(([style_names])=>{
    return ()=> style_generator(style_names);
  });
  return prms;
}

export function style_generator(style_names: string[]): string{
  return "style/" + choice(style_names); 
}