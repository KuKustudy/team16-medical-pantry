// src/Components/AddProductRecall.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MedicalInput.css"; // reuse same styling

export default function AddProductRecall() {
  const navigate = useNavigate();

  const [item_name, setItemName] = useState("");
  const [gtin, setGtin] = useState("");
  const [lot_num, setLotNo] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  function clearAll() {
    setItemName("");
    setGtin("");
    setLotNo("");
  }

  function handleRescan() {
    navigate("/ScanPage");
  }

  async function handleAddRecall() {
    setMsg({ type: "", text: "" });

    // Require at least one of Item Name OR GTIN
    if (!item_name.trim() && !gtin.trim()) {
      setMsg({
        type: "error",
        text: "Please input either Medical Item Name or Global Trade Item Number (GTIN).",
      });
      return;
    }

    // GTIN numeric length check (if provided)
    if (gtin && !/^\d{8,14}$/.test(gtin.trim())) {
      setMsg({ type: "error", text: "GTIN must be 8–14 digits (numbers only)." });
      return;
    }

    const payload = {
      item_name: item_name || "",
      GTIN: gtin || "",
      lot_number: lot_num || "",
    };

    try {
      setLoading(true);

      // ---------------------------
      // BACKEND CALL DISABLED. CHANGE THIS
      // const res = await fetch("http://localhost:8080/addRecall", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });
      // if (!res.ok) throw new Error(`Server error: ${res.status}`);
      // ---------------------------

      //Simulate success (no backend)
      await new Promise((r) => setTimeout(r, 400));
      setMsg({ type: "success", text: "Recall added successfully (local only)." });
      clearAll();
    } catch (e) {
      console.error(e);
      setMsg({ type: "error", text: "Failed to add recall. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2>Add Recall Product</h2>

      <div style={{ display: "grid", gap: 1 }}>
        <h3>Medical Item Name:</h3>
        <input
          type="text"
          value={item_name}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Enter Medical Item Name"
        />

        <h3>Global Trade Item Number (GTIN):</h3>
        <input
          type="text"
          value={gtin}
          onChange={(e) => setGtin(e.target.value)}
          placeholder="Enter GTIN Number"
          inputMode="numeric"
        />

        <h3>Lot Number:</h3>
        <input
          type="text"
          value={lot_num}
          onChange={(e) => setLotNo(e.target.value)}
          placeholder="Enter Lot Number"
        />

        {/* Actions row */}
        <div className="actions">
          <button className="rescan-button" type="button" onClick={handleRescan}>
            RESCAN
          </button>
          <button className="clear-button" type="button" onClick={clearAll}>
            CLEAR
          </button>
          <button
            className="search-button"
            onClick={handleAddRecall}
            disabled={loading}
          >
            {loading ? "ADDING..." : "ADD"}
          </button>
        </div>
      </div>

      {msg.text && (
        <p
          style={{
            color: msg.type === "error" ? "crimson" : "#2fa84f",
            textAlign: "center",
            marginTop: 12,
          }}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
