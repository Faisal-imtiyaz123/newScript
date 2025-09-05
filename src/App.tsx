// App.tsx
import { useState, useRef, useMemo, useEffect } from "react";
import { runSource } from "./compiler";
import { highlightCode } from "./highlighter/highlighter";
import "./highlighter/styles.css";

const SAMPLE = `// try typing
loyal x = 10;
say(x);
`;

export default function App() {
  const [code, setCode] = useState(SAMPLE);
  const [output, setOutput] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);

  const highlighted = useMemo(() => highlightCode(code), [code]);

  const handleRun = () => {
    setOutput([]);
    try {
      runSource(code, (s) => setOutput((prev) => [...prev, s]));
    } catch (e: any) {
      setOutput([`Error: ${e.message ?? String(e)}`]);
    }
  };

  // Sync scroll positions
  const onScroll = () => {
    if (!textareaRef.current || !preRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  // Keep scroll synced on content change
  useEffect(() => {
    if (!textareaRef.current || !preRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }, [highlighted]);

  return (
    <div style={{ display: "flex", gap: 16, padding: 16, height: "100vh", boxSizing: "border-box" }}>
      <div style={{ width:"100vw", display: "flex", flexDirection: "column", minHeight: 0,position:"relative" }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>newScript Editor</h2>
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
