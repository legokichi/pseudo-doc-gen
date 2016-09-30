

export function process(text: string): string{
  return block_math(inline_math(text));
}

export function inline_math(text: string): string{
  var PREFIX = "\n<pre><code class=\"lang-math\">";
  var SUFFIX = "</code></pre>\n";
  var reg = /\$\$([\s\S]+?)\$\$/gm;
  var tuple:RegExpExecArray|null = null;
  var _text = text;
  while(tuple = reg.exec(text)){
    _text = _text.replace(tuple[0], PREFIX + tuple[1] + SUFFIX);
  }
  return _text;
}

export function block_math(text: string): string{
  var PREFIX = "<span class=\"lang-math-inline\">```";
  var SUFFIX = "```</span>";
  var reg = /\$([^\r\n]+?)\$/g;
  var _text = text;
  var tuple:RegExpExecArray|null = null;
  while(tuple = reg.exec(text)){
    _text = _text.replace(tuple[0], PREFIX + tuple[1] + SUFFIX);
  }
  return _text;
}
