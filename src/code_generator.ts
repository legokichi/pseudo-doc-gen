const fs = require("mz/fs");
const _  = require("lodash");
const Encoding = require("encoding-japanese");

const WIDTH = 1600;

import {times, randTimes, decode, choice} from "./util";

export function ready(): Promise<() => void> {
  const prms = Promise.all<string[]>([
    fs.readdir("htdocs/image"),
    fs.readdir("htdocs/handwriting"),
    fs.readdir("htdocs/text"),
    fs.readdir("htdocs/graph"),
    fs.readdir("htdocs/math")
  ]).then(([img_names, handwriting_names, text_names, graph_names, math_names])=>{
    // 配列 -> 辞書, シャッフル
    return {
      img_names,
      handwriting_names,
      math_names,
      graph_names,
      text_names
    };
  }).then(({img_names, handwriting_names, math_names, graph_names, text_names})=>{
    // テキストファイルは内容も読む
    const prms = text_names.map((name)=> fs.readFile("htdocs/text/" + name) )
    return Promise.all(prms)
    .then((buffers)=>{
      const texts = buffers.map((buffer)=> decode(buffer));
      const text = texts.reduce((all, text)=> all+text);
      const lines = text.split("\n");
      return {
        img_names,
        handwriting_names,
        math_names,
        graph_names,
        lines
      };
    });
  }).then((o)=>{
    return ()=> code_generator(o);
  });
  return prms;
}

export function code_generator(o:{img_names: string[], handwriting_names: string[], graph_names: string[], math_names: string[], lines: string[] }): string {
  let {
    img_names,
    handwriting_names,
    math_names,
    graph_names,
    lines
  } = o;
  img_names         = _.shuffle(img_names);
  graph_names       = _.shuffle(graph_names);
  handwriting_names = _.shuffle(handwriting_names);
  //math_names        = _.shuffle(math_names);
  lines             = _.shuffle(lines);
  function img_style(): string{
    const min =  choice([30, 30, 30, 30, 30, 50, 50, 50]);
    return `
    min-width:  ${min/100*WIDTH}px;
    min-height:  600px;
    `;
  }
  function handwriting_style(): string{
    //const min =  choice([30, 30, 30, 30, 30]);
    return `
    width:  ${40/100*WIDTH}px;
    `;
  }
  function math_style(): string{
    //const min =  choice([30, 30, 30, 30, 30]);
    return `
    `;
  }
  function header_style(): string{
    const min =  choice([3,4,5,6,7]);
    return `
    font-size: ${min}em;
    `;
  }
  const tagged_lists:string[] = [];
  const tagged_header:string[] = [];
  const tagged_text:string[] = [];
  for(let i=0; i<lines.length; i++){
    const min =  choice([500, 1000, 1500]);
    const rand = Math.random()*1000;
    let str = "";
    for(; i<lines.length; i++){
      let line = lines[i];
      str += line;
      if(str.length > min + rand){
        break;
      }
    }
    const ranb = Math.random();
    if(min < 600 ){
      const style =  `
      font-size: 2em;
      width:  ${80/100*WIDTH}px;
      `;
      tagged_text.push("<span data-label='text' style='"+style+"'>" + str + "</span>");
    }else if(min < 1100 ){
      const style =  `
      font-size: 2em;
      width:  ${40/100*WIDTH}px;
      `;
      const str1 = str.slice(0, str.length/2|0);
      const str2 = str.slice(str.length/2|0, str.length);
      tagged_text.push("<span data-label='text' style='"+style+"'>" + str1 + "</span>"
                      +"<span data-label='text' style='"+style+"'>" + str2 + "</span>");
    }else{
      const style =  `
      font-size: 2em;
      width:  ${30/100*WIDTH}px;
      `;
      const str1 = str.slice(0, str.length/3|0);
      const str2 = str.slice(str.length/3|0, str.length*2/3|0);
      const str3 = str.slice(str.length*2/3|0, str.length);
      tagged_text.push("<span data-label='text' style='"+style+"'>" + str1 + "</span>"
                      +"<span data-label='text' style='"+style+"'>" + str2 + "</span>"
                      +"<span data-label='text' style='"+style+"'>" + str3 + "</span>");
    }
    const n = choice([1,2,3,4,5]);
    tagged_header.push("<h" + n + " data-label='header' style='"+header_style()+"'>"+ lines[++i%lines.length].slice(0, 7+Math.random()*20|0) +"</h" + n + ">");
    let count = Math.random()*10|0;
    let list = ""; 
    while(count--){
      list += "<li>"+lines[++i%lines.length].slice(0, 10+Math.random()*20|0)+"</li>"
    }
    tagged_lists.push("<ul data-label='list' style='font-size: 2em;'>"+list+"</ul>");
  }
  
  const tagged_handwritings = handwriting_names.map((img)=> "<img data-label='handwriting' src='/handwriting/" + img + "' style='" + handwriting_style() + "'/>");
  const tagged_imgs         = img_names.map(        (img)=> "<img data-label='image'       src='/image/"       + img + "' style='" + img_style() + "'/>");
  const tagged_math         = math_names.map(       (img)=> "<img data-label='math'        src='/math/"        + img + "' style='" + math_style() + "'/>");
  const tagged_graph        = graph_names.map(      (img)=> "<img data-label='graph'       src='/graph/"       + img + "' style='" + img_style() + "'/>");
  const merged = tagged_text.slice(0, 2).reduce((str, line)=>{
    str += (tagged_header.length       > 0 ? tagged_header.pop()       : "");
    str += line
    str += (tagged_lists.length        > 0 ? tagged_lists.pop()        : "");
    str += (tagged_imgs.length         > 0 ? tagged_imgs.pop()         : "");
    str += (tagged_handwritings.length > 0 ? tagged_handwritings.pop() : "");
    str += (tagged_math.length         > 0 ? tagged_math.pop()         : "");
    str += (tagged_graph.length        > 0 ? tagged_graph.pop()        : "");
    return str;
  }, "");
  return merged;
}
