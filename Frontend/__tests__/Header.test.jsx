import { describe, it, expect } from 'vitest'
import { Header } from '../src/Components/Header'; // Use curly braces for named import
import { MemoryRouter } from "react-router-dom";
import { render, screen } from '@testing-library/react'


/*
  this test render the Header component, and verify it contains components
  that it should:
  - the banner element
  - the link to homepage
  - the medical pantry logo
*/
describe('Header component', () => {

  // Ensures the Header renders correctly
  it('renders the Header with logo and link', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const header = screen.getByRole('banner');
    const logo = screen.getByAltText('Medical Pantry Logo');
    const link = screen.getByRole('link');
    expect(header).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
    expect(link).toBeInTheDocument();
  });

  // Verifies that the logo image has the correct alt text
  it('logo image has correct alt text', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const logo = screen.getByAltText(/medical pantry logo/i);
    expect(logo).toBeTruthy();
  });

  // Checks that at least one navigation link is rendered in the Header
  it('renders navigation links correctly', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});