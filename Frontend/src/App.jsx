import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./Pages/Home";
import { ConfirmationPage } from "./Pages/ConfirmationPage";
import { ListOfOptions } from "./Pages/OptionsPage";
import { ScanPage } from "./Pages/ScanPage";
import { AccountPage } from "./Pages/AccountPage";

export default function App() {
  return (
    <HashRouter>
      <Header />
      <nav style={{display:"flex", gap:12, padding:12}}>
        <Link to="/">Home</Link>
        <Link to="/ScanPage">ScanPage</Link>
        <Link to="/ConfirmationPage">ConfirmationPage</Link>
        <Link to="/OptionsPage">OptionsPage</Link>
        <Link to="/AccountPage">AccountPage</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ScanPage" element={<ScanPage />} />
        <Route path="/ConfirmationPage" element={<ConfirmationPage />} />
        <Route path="/OptionsPage" element={<ListOfOptions />} />
        <Route path="/AccountPage" element={<AccountPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}
