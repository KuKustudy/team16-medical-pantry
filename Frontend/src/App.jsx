import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./Pages/Home";
import { ConfirmationPage } from "./Pages/ConfirmationPage";
import { ListOfOptions } from "./Pages/OptionsPage";
import { ScanPage } from "./Pages/ScanPage";
import AccountPage from "./Pages/AccountPage";
import { CreateAccountPage } from "./Pages/CreateAccountPage";
import { LoginPage } from "./Pages/LoginPage";
import { ProductRecallPage } from "./Pages/ProductRecallPage";


export default function App() {
  return (
    <HashRouter>
      {/* <nav style={{display:"flex", gap:12, padding:12}}>
        <Link to="/">Home</Link>
        <Link to="/ScanPage">ScanPage</Link>
        <Link to="/ConfirmationPage">ConfirmationPage</Link>
        <Link to="/OptionsPage">OptionsPage</Link>
        <Link to="/AccountPage">AccountPage</Link>
        <Link to="/CreateAccountPage">CreateAccountPage</Link>
        <Link to="/LoginPage">LoginPage</Link>
        <Link to="/ProductRecallPage">ProductRecallPage</Link>
      </nav>*/}
      
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ScanPage" element={<ScanPage />} />
        <Route path="/ConfirmationPage" element={<ConfirmationPage />} />
        <Route path="/OptionsPage" element={<ListOfOptions />} />
        <Route path="/AccountPage" element={<AccountPage />} />
        <Route path="/CreateAccountPage" element={<CreateAccountPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/ProductRecallPage" element={<ProductRecallPage />} />
        <Route path="*" element={<Home />} />
      </Routes>

    </HashRouter>
  );
}
