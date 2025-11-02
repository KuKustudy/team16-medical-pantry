import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App";
import { ClerkProvider } from "@clerk/clerk-react";


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

describe("App component", () => {
  it("renders the header (banner role) successfully", () => {
    render(
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    );
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });


  it("smoke test: renders without crashing and shows the logo", () => {
    render(
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    );

    const logo = screen.getByAltText(/medical pantry logo/i);
    expect(logo).toBeInTheDocument();
  });
});
