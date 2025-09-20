import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./MedicalInput.css";
import { ScanPage } from "../Pages/ScanPage";

export default function MedicalInput() {
  const navigate = useNavigate();                

  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ItemName, setItemName] = useState("");
  const [GTIN, setGTIN] = useState("");
  const [BatchNumber, setBatchNumber] = useState("");
  const [LotNumber, setLotNumber] = useState("");

  /*
  // temporary database (delete when backend is ready)
  async function searchMedicalItem(query) {
    const MOCK_DB = [
      { Name: "Paracetamol", GTIN_num: "09345678901234", Batch_num: "B123", Lot_num: "L001", recalled: true},
      { Name: "Ibuprofen",   GTIN_num: "01234567890123", Batch_num: "B777", Lot_num: "L222", recalled: true},
      { Name: "Ibuprofen",   GTIN_num: "01234567890000", Batch_num: "B111", Lot_num: "L111", recalled: false},
      { Name: "Cetrizine",   GTIN_num: "00999999999999", Batch_num: "B123", Lot_num: "L003", recalled: false},
    ];

    const name  = query.Name.trim().toLowerCase();
    const GTIN  = query.GTIN_num.trim();
    const batch_number = query.Batch_num.trim().toLowerCase();
    const lot_number   = query.Lot_num.trim().toLowerCase();

    return MOCK_DB.filter(item => {
      const nameOK  = !name  || item.Name.toLowerCase().includes(name);
      const gtinOK  = !gtin  || item.GTIN_num === gtin;
      const batchOK = !batch || (item.Batch_num?.toLowerCase() === batch);
      const lotOK   = !lot   || (item.Lot_num?.toLowerCase() === lot);
      return nameOK && gtinOK && batchOK && lotOK;
    });
  }
  */



  async function handleSearchItem() {
    setError("");

    // require at least Item Name or GTIN(hasa to be between 8-14 digits)
  if (GTIN && !/^\d{8,14}$/.test(GTIN.trim())) {
    setError("GTIN must be 8–14 digits (numbers only).");
    return;
  }

  const query = {
  name: ItemName || "",
  GTIN: GTIN || "",
  batch_number: BatchNumber || "",
  lot_number: LotNumber || ""
  };

  fetch("http://localhost:8080/mongoSearch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query)
  }).then(response => {
  if (!response.ok) {
    throw new Error("Server error: " + response.status);
  }
  return response.json(); // or response.text() if backend returns plain text
  })
  .then(data => {
    console.log("Response from server:", data);
  })
  .catch(error => {
    console.error("Fetch error:", error);
  });


    try {
      setLoading(true);
      const found = await searchMedicalItem(query);
      setResults(found);
      setQueries(prev => [query, ...prev]);

      // redirect to OptionsPage with the results
      navigate("/OptionsPage", { state: { results: found } });
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setItemName("");
    setGTIN("");
    setBatchNumber("");
    setLotNumber("");
    setResults([]);
    setError("");
  }

  function handleRescan() {
    navigate("/ScanPage");
  }

  return (
    <div style={{ maxWidth: 520, margin: "10px auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Medical Item Search</h2>

      <div style={{ display: "grid", gap: 1 }}>
        <h3>Medical Item Name:</h3>
        <input
          type="text"
          value={ItemName}
          onChange={e => setItemName(e.target.value)}
          placeholder="Enter Product Name"
        />
        <h3>Global Trade Item Number (GTIN):</h3>
        <input
          type="text"
          value={GTIN}
          onChange={e => setGTIN(e.target.value)}
          placeholder="Enter GTIN Number"
          inputMode="numeric"
        />
        <h3>Batch Number:</h3>
        <input
          type="text"
          value={BatchNumber}
          onChange={e => setBatchNumber(e.target.value)}
          placeholder="Enter Batch Number"
        />
        <h3>Lot Number:</h3>
        <input
          type="text"
          value={LotNumber}
          onChange={e => setLotNumber(e.target.value)}
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
