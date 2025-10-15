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
    
    // Verify the header element is rendered
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
    
    // Verify the logo image is rendered with correct alt text
    const logoImage = screen.getByAltText('Medical Pantry Logo');
    expect(logoImage).toBeInTheDocument();
    
    // Verify the link is present
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();

    screen.debug(); // prints out the jsx on command line
  })
})

// a template for writing tests
// describe('A truthy statement', () => {
//   it('should be equal to 2', () => {
//     expect(1+1).toEqual(2)
//   })
// })