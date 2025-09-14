import React, { useState } from "react";
import "./MedicalInput.css";

export default function MedicalInput() {
  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ItemName, setItemName] = useState("");
  const [GTIN, setGTIN] = useState("");
  const [BatchNumber, setBatchNumber] = useState("");
  const [LotNumber, setLotNumber] = useState("");

  async function searchMedicalItem(query) {
    const MOCK_DB = [
      { Name: "Paracetamol", GTIN_num: "09345678901234", Batch_num: "B123", Lot_num: "L001" },
      { Name: "Ibuprofen",   GTIN_num: "01234567890123", Batch_num: "B777", Lot_num: "L222" },
      { Name: "Cetrizine",   GTIN_num: "00999999999999", Batch_num: "B123", Lot_num: "L003" },
    ];

    const name  = query.Name.trim().toLowerCase();
    const gtin  = query.GTIN_num.trim();
    const batch = query.Batch_num.trim().toLowerCase();
    const lot   = query.Lot_num.trim().toLowerCase();

    return MOCK_DB.filter(item => {
      const nameOK  = !name  || item.Name.toLowerCase().includes(name);
      const gtinOK  = !gtin  || item.GTIN_num === gtin;
      const batchOK = !batch || (item.Batch_num?.toLowerCase() === batch);
      const lotOK   = !lot   || (item.Lot_num?.toLowerCase() === lot);
      return nameOK && gtinOK && batchOK && lotOK;
    });
  }

  async function handleSearchItem() {
    setError("");

    // At least one of ItemName OR GTIN must be provided
    if (!ItemName.trim() && !GTIN.trim()) {
      setError("Please enter either an Item Name or a GTIN number.");
      return;
    }

    const query = {
      Name: ItemName || "",
      GTIN_num: GTIN || "",
      Batch_num: BatchNumber || "",
      Lot_num: LotNumber || "",
    };

    try {
      setLoading(true);
      const found = await searchMedicalItem(query);
      setResults(found);
      setQueries(prev => [query, ...prev]);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
      // reset inputs after search
      setItemName("");
      setGTIN("");
      setBatchNumber("");
      setLotNumber("");
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

        {/* Actions: Recan, clear and search button*/}
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

      {/* Results */}
      <div style={{ marginTop: 20 }}>
        <h3>Results</h3>
        {loading && <p>Loading…</p>}
        {!loading && results.length === 0 && <p>No results to show.</p>}
        {!loading && results.length > 0 && (
          <ul>
            {results.map((r, idx) => (
              <li key={idx}>
                <b>{r.Name}</b> — GTIN: {r.GTIN_num}
                {r.Batch_num ? ` | Batch: ${r.Batch_num}` : ""}
                {r.Lot_num ? ` | Lot: ${r.Lot_num}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Query history */}
      <div style={{ marginTop: 20 }}>
        <h4>Recent Searches</h4>
        {queries.length === 0 ? (
          <p>None yet.</p>
        ) : (
          <ol>
            {queries.map((q, i) => (
              <li key={i}>
                {q.Name || "(no name)"} | {q.GTIN_num || "(no GTIN)"} | {q.Batch_num || "(no batch)"} | {q.Lot_num || "(no lot)"}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
