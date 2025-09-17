import { describe, it, expect } from 'vitest'
import { Header } from '../src/Components/Header'; // Use curly braces for named import
import { render, screen } from '@testing-library/react'

describe('Header', () => {
  it('renders the Header component', () => {
    render(<Header />)
    
    // Verify the header element is rendered
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
    
    // Verify the logo image is rendered with correct alt text
    const logoImage = screen.getByAltText('Medical Pantry Logo');
    expect(logoImage).toBeInTheDocument();
    
    // Verify the button is present
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    screen.debug(); // prints out the jsx on command line
  })
})

describe('A truthy statement', () => {
  it('should be equal to 2', () => {
    expect(1+1).toEqual(2)
  })
})