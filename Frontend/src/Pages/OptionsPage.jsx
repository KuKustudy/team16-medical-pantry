import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "/src/assets/Icon.png";
import { Header } from "../Components/Header";
import "./OptionsPage.css";

export function ListOfOptions() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(-1);

  const results = useMemo(
    () => (Array.isArray(location.state?.results) ? location.state.results : []),
    [location.state]
  );

  return (
    <div className="List-Of-Options">
      <div className="page-header">
        <Header />
        <h1>Results</h1>
      </div>

      <div className="results-scroll">
        {results.length === 0 ? (
          <div className="no-results" aria-live="polite">
            No results found.
          </div>
        ) : (
          <ol className="results-list">
            {results.map((item, index) => {
              const isOpen = expandedIndex === index;
              return (
                <li key={index} className="result-item">
                  <div className="option-row">
                    <span className="text">
                      <b>{item.item_name}</b> — GTIN: {item.GTIN}
                      {item.lot_number ? ` | Lot: ${item.lot_number}` : ""}
                    </span>

                    <button
                      className="expand-button"
                      onClick={() =>
                        setExpandedIndex((prev) => (prev === index ? -1 : index))
                      }
                      aria-expanded={isOpen}
                      title={isOpen ? "Collapse" : "Expand"}
                    >
                      <img src={Icon} alt="" className="expand-icon" />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="details-panel">
                      <div className="detail-row">
                        <span className="label">Item Name:</span>
                        <span className="value">{item.item_name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">GTIN:</span>
                        <span className="value">{item.GTIN}</span>
                      </div>
                      {item.lot_number && (
                        <div className="detail-row">
                          <span className="label">Lot Number:</span>
                          <span className="value">{item.lot_number}</span>
                        </div>//
                      )}
                      <div className="detail-row">
                        <span className="label">Recall Status:</span>
                        <span className="value recall">Recalled</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Data source:</span>
                        <a className="value link" href="#" onClick={(e) => e.preventDefault()}>
                          TGA website
                        </a>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <div className="rescan-footer">
          <button
            type="button"
            className="rescan-btn"
            onClick={() => navigate("/ScanPage")}
          >
            RESCAN
          </button>
        </div>
      </div>
    </div>
  );
}