import "./Header.css";
import { Link } from "react-router-dom";
import MedicalPantryLogo from "../assets/MedicalPantryLogo.png";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'


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

      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      
    </header>
  );
}
