import "./Header.css";
import { Link } from "react-router-dom";
import MedicalPantryLogo from "../assets/MedicalPantryLogo.png";
import { SignedIn, SignedOut, SignInButton, UserButton} from '@clerk/clerk-react'



export function Header() {

  return (
    <header className="header" role="banner">
      <Link to="/Home" className="header-button" aria-label="Go home">
        <img
          className="navbar-brand-logo"
          src={MedicalPantryLogo}
          alt="Medical Pantry Logo"
        />
      </Link>

      {/*       <div className="header-buttons">
        <SignedOut>
          <SignInButton className="cl-signInButton"/>
        </SignedOut>
        <SignedIn>
          <UserButton className="cl-userButtonBox"/>
        </SignedIn>
      </div>*/}

      
    </header>
  );
}
