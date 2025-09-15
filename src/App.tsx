// App.tsx
import { useState, useRef, useMemo, useEffect } from "react";
import { runSource } from "./compiler";
import "./App.css";
import "../src/highlighter/styles.css"
import { highlightCode } from "./highlighter/highlighter";

const SAMPLE = `// newScript Example Programs
// Explore syntax, types, functions, and control flow

// === Variables ===
var w = 5;
let x = 10;
const y = 0;
loyal z = 0;   // loyal a = 0 is same as writing const a = 0

say("x = " + w); // say is same as print
print("y = " + x);
say("pi = " + y);

// === Types ===
var a: number = 42;
let b: string = "hello world";
const c: boolean = true;
loyal d: any = "can change type later";

say(a);
print(b);
say(c);
print(d);

// === Operators ===
var sum = a plus 10; // for add can use both plus and +
var diff = a minus 5; // for minus can use both - and minus
var prod = a into 2; // for multiplying can use both * and into
var quotient = a by 2; // for division can use both by and /
var compGre = a isgre 20; // for comparision can use both isgre and >
var compLess = a isless 20; // for comparision can use both isless and <

say("sum = " + sum);
say("diff = " + diff);
say("prod = " + prod);
say("quotient = " + quotient);
say("a > 20 --> " + compGre);
say("a < 20 --> " + compLess);

// === Functions ===
// to make a function write declare
// to return write emit
declare add(n1: number, n2: number): number { 
  emit n1 plus n2;
}

declare greet(name: string): string {
  emit "Hello, " + name;
}

say(add(7, 8));
say(greet("newLang"));

// === Conditionals ===
if (a isgre 40) {
  say("a is greater than 40");
} else {
  say("a is less or equal to 40");
}

// === Loops ===
var counter = 0;
while (counter isless 5) {
  say("counter = " + counter);
  counter = counter plus 1;
}

// === For Loop ===
for (var i = 0; i isless 3; i++) {
  say("i = " + i);
}

// === Post Fix ===
let myvar = 2;
myvar+=2;
say(myvar + " myvar+=2");
myvar-=2;
say(myvar + " mvyar-=2");
myvar*=2;
say(myvar + " mvyar*=2");
myvar/=2;
say(myvar + " mvyar/=2");

// === End of Examples ===
 `


export default function App() {
  const [code, setCode] = useState(SAMPLE);
  const [output, setOutput] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);
  const highlighted = useMemo(() => highlightCode(code), [code]);
  const lineNumbers = useMemo(()=>{
    const lines = code.split("\n").length
    const arr=[];
    for(let i=0;i<lines;i++)arr.push(i+1);
    return arr;
  },[code])
  const handleRun = () => {
    setOutput([]);
    try {
      runSource(code, (s) => setOutput((prev) => [...prev, s]));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setOutput([`Error: ${e.message ?? String(e)}`]);
    }
  };

  // Sync scroll positions
  const onScroll = () => {
    if (!textareaRef.current || !preRef.current || !lineNumbersRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
  };

  // Keep scroll synced on content change
  useEffect(() => {
    if (!textareaRef.current || !preRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }, [highlighted]);

  return (
    <div style={{ display: "flex", gap: 16, padding: 16, boxSizing: "border-box" }}>
      <div style={{ width:"100vw", display: "flex", flexDirection: "column", minHeight: 0,position:"relative" }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>newScript Editor</h2>
      <div style={{height:"100vh",display:"flex"}}>
        <div ref={lineNumbersRef} className="line-numbers">
          {
            lineNumbers.map((lineNum)=> 
              <span key={lineNum} >
                {lineNum}
              </span>
            )
          }
        </div>
        <div className="editor-container">
          <pre
            ref={preRef}
            className="highlight-layer"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
          <textarea
            ref={textareaRef}
            className="editor-layer"
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={onScroll}
          />
        </div>
        </div>
        <button
          onClick={handleRun}
          style={{ padding: "8px 12px",right:5, top:40 ,position:"absolute",zIndex:4,backgroundColor:"green",color:"white",cursor:"pointer"}}
        >
          Run
        </button>
      </div>
      <div style={{width: 430, display: "flex", flexDirection: "column"}}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Output</h2>
        <pre style={{ flex:1,margin:0, background: "#111", color: "#0f0", overflow: "auto" ,padding:10}}>
          {output.join("\n")}
        </pre>
      </div>
    </div>
  );
}
