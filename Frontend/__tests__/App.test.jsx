import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App";

describe('App component', () => {

  // Ensures that the app renders the header correctly.
  it('renders the header (banner role) successfully', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  // Checks that main navigation links are visible.
  it('renders navigation links (e.g., Home, ScanPage, etc.)', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ScanPage' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'OptionsPage' })).toBeInTheDocument();
  });

  // Smoke test — verifies the app loads without crashing and displays the logo.
  it('smoke test: renders without crashing and shows the logo', () => {
    render(<App />);
    const logo = screen.getByAltText(/medical pantry logo/i);
    expect(logo).toBeInTheDocument();
  });
});