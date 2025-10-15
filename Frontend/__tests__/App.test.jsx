import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App";

describe('App component', () => {
  it('renders the header (banner role) successfully', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('renders navigation links (e.g., Home, ScanPage, etc.)', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ScanPage' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'OptionsPage' })).toBeInTheDocument();
  });

  it('smoke test: renders without crashing and shows the logo', () => {
    render(<App />);
    const logo = screen.getByAltText(/medical pantry logo/i);
    expect(logo).toBeInTheDocument();
  });
});