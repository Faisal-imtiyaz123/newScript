import { useState } from "react";
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "100vh",
        gap: 16,
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      {/* Editor */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 8 }}>newScript Editor</h2>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            flex: 1,
            fontFamily: "monospace",
            fontSize: 14,
            padding: 12,
            resize: "none",
          }}
        />
        <button
          onClick={handleRun}
          style={{
            marginTop: 8,
            padding: "8px 12px",
            alignSelf: "flex-start",
            width:"100%"
          }}
        >
          Run
        </button>
      </div>

      {/* Output */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 8 }}>Output</h3>
        <pre
          style={{
            flex: 1,
            background: "#111",
            color: "#0f0",
            padding: 12,
            whiteSpace: "pre-wrap",
            overflow: "auto",
          }}
        >
          {output.join("\n")}
        </pre>
      </div>
    </div>
  );
}
