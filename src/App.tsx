
import { useState } from "react";
import { Lexer } from "./compiler/lexer/Lexer";

export default function App() {
  const [text,setText] = useState<string>("");
  const lexer = new Lexer(text);
  return <div>
    <textarea  style={{ flex: 1, fontFamily: "monospace", fontSize: 14, padding: 12 }} value={text} onChange={(e)=>{
      setText(e.target.value);
    }}/>
    <button onClick={()=>console.log(lexer.tokenize())}>Lex</button>
  </div>
}
