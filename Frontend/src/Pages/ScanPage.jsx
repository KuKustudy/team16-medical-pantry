import React from "react";
import SimpleCam from "../Components/SimpleCam";
import { Header } from "../Components/Header";

export function ScanPage() {
  return (
    <>
    <Header />
      <main style={{ padding: 0, margin: 0 }}>
        <SimpleCam />
      </main>
    </>
  );
}
