import {  useState } from "react";
import { runSource } from "./compiler";

const SAMPLE = ``;
export default function App() {
  const [code, setCode] = useState(SAMPLE);
  const [output, setOutput] = useState<string[]>([]);

  const handleRun = () => {
    setOutput([]);
    try {
      runSource(code, (s) => setOutput((prev) => [...prev, s]));
    } catch (e: any) {
      setOutput([`Error: ${e.message ?? String(e)}`]);
    }
  };
  console.log(output)
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "100vh", padding: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <h2>newScript+ — editor</h2>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ flex: 1, fontFamily: "monospace", fontSize: 14, padding: 12 }}
        />
        <button onClick={handleRun} style={{ marginTop: 8, padding: "8px 12px" }}>
          Run & Visualize AST
        </button>
        <h3>Output</h3>
        <pre style={{ background: "#111", color: "#0f0", padding: 12, minHeight: 160, whiteSpace: "pre-wrap" }}>
{output.join("\n")}
        </pre>
      </div>
    </div>
  );
}
