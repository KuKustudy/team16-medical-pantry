import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Icon from "/src/assets/Icon.png";
import { Header } from "../Components/Header";

export function ListOfOptions() {
  const location = useLocation();
  const [expandedIndex, setExpandedIndex] = useState(-1);

  // Prefer results from the ConfirmationPage; fall back to empty array
  const results = useMemo(() => {
    if (Array.isArray(location.state?.results)) return location.state.results;
    return [];
  }, [location.state]);

  function ExpandOption(index) {
    setExpandedIndex(prev => (prev === index ? -1 : index));
  }

  return (
    <div className="List-Of-Options">
      <Header />
      <h1>Results</h1>
      <hr className="divider" />

      {results.length === 0 ? (
  <div className="no-results" aria-live="polite">
    No results found.
  </div>
) : (
  <ol>
    {results.map((item, index) => {
      const rowClass = `option-row ${item.recalled ? "is-recalled" : "is-clear"}`;
      const panelBorder = item.recalled ? "#FBD2D2" : "#e6f7e6";

      return (
        <React.Fragment key={index}>
          <li className={rowClass}>
            <span className="text">
              <b>{item.Name}</b> — GTIN: {item.GTIN_num}
              {item.Batch_num ? ` | Batch: ${item.Batch_num}` : ""}
              {item.Lot_num ? ` | Lot: ${item.Lot_num}` : ""}
            </span>
            <button
              className="expand-button"
              onClick={() => setExpandedIndex(prev => (prev === index ? -1 : index))}
              aria-expanded={expandedIndex === index}
              title={expandedIndex === index ? "Collapse" : "Expand"}
            >
              <img src={Icon} alt="Expand" className="expand-icon" />
            </button>
          </li>

          {expandedIndex === index && (
            <div
              style={{
                textAlign: "left",
                marginTop: -10,
                marginBottom: 20,
                padding: "10px 14px",
                border: `2px solid ${panelBorder}`,
                borderRadius: 18,
                background: "#fff",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.35 }}>
                <li><b>Name:</b> {item.Name}</li>
                <li><b>GTIN:</b> {item.GTIN_num}</li>
                {item.Batch_num && <li><b>Batch:</b> {item.Batch_num}</li>}
                {item.Lot_num && <li><b>Lot:</b> {item.Lot_num}</li>}
                <li><b>Status:</b> {item.recalled ? "Recalled" : "Not recalled"}</li>
              </ul>
            </div>
          )}
        </React.Fragment>
      );
    })}
  </ol>
)}

    </div>
  );
}
