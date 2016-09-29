/// <reference path="../typings/index.d.ts" />

const fs = require("mz/fs");
const _  = require("lodash");


export function ready(): Promise<() => void> {
  // 文章捏造のための情報ソースのディレクトリ読み込み
  const prms = Promise.all<string[]>([
    fs.readdir("htdocs/image"),
    fs.readdir("htdocs/chars"),
    fs.readdir("htdocs/handwriting"),
    fs.readdir("htdocs/text")
  ]).then(([img_names, chars_names, handwriting_names, text_names])=>{
    // テキストファイルは内容も読む
    const prms = text_names.map((name)=> fs.readFile("htdocs/text/"+ name, {encoding: "utf8"}) )
    return Promise.all<string>(prms)
    .then((texts)=>{
      return {
        img_names:   _.shuffle(img_names),
        chars_names: _.shuffle(chars_names),
        handwriting_names, texts
      };
    });
  }).then(({img_names, chars_names, handwriting_names, texts})=>{
    return ()=> md_generator(img_names, chars_names, handwriting_names, texts);
  });
  return prms;
}

export type Markdown = string;

export function md_generator(img_names: string[], chars_names: string[], handwriting_names: string[], texts: string[]): Markdown {
  const text = texts.reduce((all, text)=> all+text);
  const lines = _.shuffle(text.split("\n"));
  function gen(): string{
    const rand = Math.random();
    const ranb = Math.random();
    const width = ranb < 1/3 ? 30
                : ranb < 2/3 ? 60
                :              90
    return `
    width: ${width}%;
    `;
  }
  const tagged_text:string[] = [];
  for(let i=0; i<lines.length; i++){
    let str = "";
    for(; i<lines.length; i++){
      let line = lines[i];
      str += line;
      if(Math.random()>0.95){
        break;
      }
    }
    tagged_text.push("<span data-label='text' style='" + gen() + "'>" + str + "</span>");
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
  return merged;
}
