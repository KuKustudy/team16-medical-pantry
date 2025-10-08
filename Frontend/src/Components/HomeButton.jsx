import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomeButton.css";

export default function HomeButtons() {
  const navigate = useNavigate();

  return (
    <section className="home-buttons">
      <p className="home-subtitle">
        Scan name/barcode on products, confirm and get recall information
      </p>

      <div className="home-actions">
        <button
          type="button"
          className="home-btn home-btn--scan"
          onClick={() => navigate("/ScanPage")}
        >
          <span className="home-btn__icon" aria-hidden>🔎</span>
          <span>SCAN</span>
        </button>

        <button
          type="button"
          className="home-btn home-btn--confirm"
          onClick={() => navigate("/ConfirmationPage")}
        >
          <span className="home-btn__icon" aria-hidden>📝</span>
          <span>CHECK ITEM TO RECALLED ITEMS</span>
        </button>
      </div>
    </section>
  );
}
