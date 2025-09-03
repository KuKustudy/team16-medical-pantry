import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./Pages/Home";
import { Page1 } from "./Pages/Page1";
import { Page2 } from "./Pages/Page2";
import { Page3 } from "./Pages/Page3";

export default function App() {
  return (
    <HashRouter>
      <nav style={{display:"flex", gap:12, padding:12}}>
        <Link to="/">Home</Link>
        <Link to="/page1">Page1</Link>
        <Link to="/page2">Page2</Link>
        <Link to="/page3">Page3</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="/page3" element={<Page3 />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}
