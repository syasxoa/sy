import React from "react";
import { createRoot } from "react-dom/client";
import SplitText from "./src/components/SplitText.jsx";
import "./style.css";
function App() { return <main><p>纹境 · 独立试验区</p><h1><SplitText text="纹样，缓缓展开" tag="span" /></h1><p>这是 React Bits 的文字动画示例。刷新页面可以重新观看。</p><p>后续可在这里试用其他组件，原有 V006 网页保持原样。</p></main>; }
createRoot(document.getElementById("root")).render(<App />);
