/// <reference path="../typings/index.d.ts" />

const fs = require("mz/fs");
const _  = require("lodash");
const Encoding = require("encoding-japanese");
import * as MathEsc from "./mathjax-escaper";
import {times, randTimes} from "./util";
export function ready(): Promise<() => void> {
  // 文章捏造のための情報ソースのディレクトリ読み込み
  const prms = Promise.all<string[]>([
    fs.readdir("htdocs/image"),
    fs.readdir("htdocs/chars"),
    fs.readdir("htdocs/handwriting"),
    fs.readdir("htdocs/text"),
    fs.readdir("htdocs/math")
  ]).then(([img_names, chars_names, handwriting_names, text_names, math_names])=>{
    // テキストファイルは内容も読む
    const prms = text_names.map((name)=> fs.readFile("htdocs/text/" + name) )
    return Promise.all(prms)
    .then((buffers)=>{
      const texts = buffers.map((buffer)=> Encoding.codeToString(Encoding.convert(buffer, 'UNICODE', 'AUTO')));
      return {
        img_names:   _.shuffle(img_names),
        chars_names: _.shuffle(chars_names),
        handwriting_names: _.shuffle(handwriting_names),
        math_names: _.shuffle(math_names),
        texts
      };
    });
  }).then(({img_names, chars_names, handwriting_names, math_names, texts})=>{
    // 1ファイル 1数式で
    const prms = math_names.map((name)=> fs.readFile("htdocs/math/" + name) )
    return Promise.all(prms)
    .then((buffers)=>{
      const maths = buffers.map((buffer)=> Encoding.codeToString(Encoding.convert(buffer, 'UNICODE', 'AUTO')));
      const _maths = maths.map((math)=> MathEsc.process(math));
      return {img_names, chars_names, handwriting_names, math: _maths, texts};
    });
  }).then(({img_names, chars_names, handwriting_names, math, texts})=>{
    return ()=> md_generator(img_names, chars_names, handwriting_names, math, texts);
  });
  return prms;
}

export type Markdown = string;

export function md_generator(img_names: string[], chars_names: string[], handwriting_names: string[], math: string[], texts: string[]): Markdown {
  const text = _.shuffle(texts).reduce((all, text)=> all+text);
  const lines = _.shuffle(text.split("\n"));
  return `
  # a
  
  huga

  * aa
    * bbpos
      * cc

  *a* wapog

  **aa** egwapgko a

  ***aaa*** dpkagpg rakg prmehap 

  ## aaa

  fdkgsp

  ${math[0]} 
  `;

  /*
  for ()
  if(rand > 0.9){

  }else if(rand > 0.8){

  }else{

  }
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
  */

}

export function section(genLine: ()=> string, n: number): string{
  const header = times("#", n) + genLine();
  const tokens = [header];
  randTimes(()=>{
    const rand = Math.random();
    if(rand > 0.98 && n < 6){
      // sub section
      return randTimes(()=> section(genLine, n+1), 0.90)
      .forEach((a)=> tokens.push(a));
    }else{
      // paragraph
      return randTimes(()=> paragraph(genLine), 0.98)
      .forEach((a)=> tokens.push(a));
    }
  }, 0.9);
  return tokens.join("\n\n");
}

export function paragraph(genLine: ()=> string): string{
  return "something";
}

console.log(section(()=>"ap ko fdsa", 1));