import { describe, it, expect } from 'vitest'
import { Header } from '../src/Components/Header'; // Use curly braces for named import
import { MemoryRouter } from "react-router-dom";
import { render, screen } from '@testing-library/react'
import { ClerkProvider } from '@clerk/clerk-react'


/*
  this test render the Header component, and verify it contains components
  that it should:
  - the banner element
  - the link to homepage
  - the medical pantry logo
*/
describe('render the Header component', () => {
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  it('renders the Header component', () => {
    render(    
    <MemoryRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Header />
      </ClerkProvider>
    </MemoryRouter>
    );
    const header = screen.getByRole('banner');
    const logo = screen.getByAltText('Medical Pantry Logo');
    const link = screen.getByRole('link');
    expect(header).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
    expect(link).toBeInTheDocument();
  });

  it('logo image has correct alt text', () => {
    render(
      <MemoryRouter>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <Header />
        </ClerkProvider>
      </MemoryRouter>
    );
    const logo = screen.getByAltText(/medical pantry logo/i);
    expect(logo).toBeTruthy();
  });

  it('renders navigation links correctly', () => {
    render(
      <MemoryRouter>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <Header />
        </ClerkProvider>
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});