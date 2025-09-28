import { describe, it, expect } from 'vitest'
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import SimpleCam from '../src/Components/SimpleCam'; // Use curly braces for named import
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from '@testing-library/react'

describe('render the SimpleCam', () => {
  it('verify that the camera and button have been rendered', () => {
    render(    
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleCam />} />
        </Routes>
      </BrowserRouter>
    
    );
    
    // Verify the camera element is rendered
    const webcamElement = screen.getByTestId("webcam");
    expect(webcamElement).toBeInTheDocument();
    
    // Verify the capture button is present
    const captureButton = screen.getByRole('button');
    expect(captureButton).toBeInTheDocument();

    screen.debug(); // prints out the jsx on command line
  })
})

// still need to work out how to mock a webcam in vitest...
describe('testing the capture button', () => {
  it('verify that the camera and button have been rendered', () => {
    render(    
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleCam />} />
        </Routes>
      </BrowserRouter>
    );

    screen.debug(); // prints out the jsx on command line
  })
})
