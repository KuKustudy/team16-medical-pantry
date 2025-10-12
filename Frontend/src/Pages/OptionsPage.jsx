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

      {/* Scroll area takes remaining height; footer is sticky at bottom */}
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
                  {/* Red pill header */}
                  <div className="option-row">
                    <span className="text">
                      <b>{item.Name}</b> — GTIN: {item.GTIN_num}
                      {item.Batch_num ? ` | Batch: ${item.Batch_num}` : ""}
                      {item.Lot_num ? ` | Lot: ${item.Lot_num}` : ""}
                    </span>

                    <button
                      className="expand-button"
                      onClick={() =>
                        setExpandedIndex(prev => (prev === index ? -1 : index))
                      }
                      aria-expanded={isOpen}
                      title={isOpen ? "Collapse" : "Expand"}
                    >
                      <img src={Icon} alt="" className="expand-icon" />
                    </button>
                  </div>

                  {/* Details card (below the pill) */}
                  {isOpen && (
                    <div className="details-panel">
                      <div className="detail-row">
                        <span className="label">Item Name:</span>
                        <span className="value">{item.Name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">GTIN:</span>
                        <span className="value">{item.GTIN_num}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Recall Status:</span>
                        <span className="value recall">Recalled</span>
                      </div>
                      {item.Batch_num && (
                        <div className="detail-row">
                          <span className="label">Batch Number:</span>
                          <span className="value">{item.Batch_num}</span>
                        </div>
                      )}
                      {item.Lot_num && (
                        <div className="detail-row">
                          <span className="label">Lot Number:</span>
                          <span className="value">{item.Lot_num}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="label">Data source:</span>
                        <a className="value link" href="#" onClick={e => e.preventDefault()}>
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

        {/* Sticky footer with the RESCAN button */}
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
