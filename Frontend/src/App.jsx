import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./Pages/Home";
import { Page1 } from "./Pages/Page1";
import { Page2 } from "./Pages/Page2";
import { ConfirmationPage } from "./Pages/ConfirmationPage";
import { ListOfOptions } from "./Pages/OptionsPage";
import { ScanPage } from "./Pages/ScanPage";

export default function App() {
  return (
    <HashRouter>
      <nav style={{display:"flex", gap:12, padding:12}}>
        <Link to="/">Home</Link>
        <Link to="/ScanPage">ScanPage</Link>
        <Link to="/ConfirmationPage">ConfirmationPage</Link>
        <Link to="/OptionsPage">OptionsPage</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ScanPage" element={<ScanPage />} />
        <Route path="/ConfirmationPage" element={<ConfirmationPage />} />
        <Route path="/OptionsPage" element={<ListOfOptions />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}
