import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MedicalInput.css";

export default function MedicalInput({ initialItemName = "" }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ItemName, setItemName] = useState(initialItemName);
  const [GTIN_num, setGTIN_num] = useState("");
  const [LotNumber, setLotNumber] = useState("");

  async function handleSearchItem() {
    setError("");

    // Require at least one of Item Name OR GTIN
    if (!ItemName.trim() && !GTIN_num.trim()) {
      setError("Please enter either an Item Name or a GTIN number.");
      return;
    }

    // GTIN numeric length check (if provided)
    if (GTIN_num && !/^\d{8,14}$/.test(GTIN_num.trim())) {
      setError("GTIN must be 8–14 digits (numbers only).");
      return;
    }

    const query = {
      item_name: ItemName || "",
      GTIN: GTIN_num || "",
      lot_number: LotNumber || "",
    };

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: ItemName || "",
          GTIN: GTIN_num || "",
          lot_number: LotNumber || "",
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      // Backend returns a TOP-LEVEL ARRAY
      const payload = await res.json(); // e.g., [{ _id, GTIN, name, score }, ...]

      // Normalize to your UI shape
      const normalized = (Array.isArray(payload) ? payload : []).map(r => ({
        _id: String(r._id ?? ""),
        item_name: r.item_name ?? "",         // map "name" -> "item_name"
        GTIN: r.GTIN ?? "",
        lot_number: r.lot_number ?? "",  // backend doesn't send it; stay empty
        score: r.score ?? null,          // keep the score if you want to display it
      }));

      navigate("/OptionsPage", { state: { results: normalized } });
    } catch (e) {
      console.error(e);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setItemName("");
    setGTIN_num("");
    setLotNumber("");
    setError("");
  }

  function handleRescan() {
    navigate("/ScanPage");
  }

  return (
    <div className="page">
      <h2>Medical Item Search</h2>

      <div style={{ display: "grid", gap: 1 }}>
        <h3>Medical Item Name:</h3>
        <textarea
          value={ItemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Enter Product Name"
        />
        <h3>Global Trade Item Number (GTIN):</h3>
        <input
          type="text"
          value={GTIN_num}
          onChange={(e) => setGTIN_num(e.target.value)}
          placeholder="Enter GTIN Number"
          inputMode="numeric"
        />
        <h3>Lot Number:</h3>
        <input
          type="text"
          value={LotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          placeholder="Enter Lot Number"
        />

        <div className="actions">
          <button className="rescan-button" type="button" onClick={handleRescan}>
            Rescan
          </button>
          <button className="clear-button" type="button" onClick={clearAll}>
            Clear
          </button>
          <button
            className="search-button"
            onClick={handleSearchItem}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
    </div>
  );
}