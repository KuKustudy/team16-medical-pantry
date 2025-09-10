import './Header.css';
import MedicalPantryLogo from "../assets/MedicalPantryLogo.png"; // adjust path as needed

export function Header() {
  return (
    <header className="header" role="banner">
      <button className="header-button">
        <img 
          className="navbar-brand-logo" 
          src={MedicalPantryLogo} 
          alt="Medical Pantry Logo" 
        />
      </button>
    </header>
  );
}
