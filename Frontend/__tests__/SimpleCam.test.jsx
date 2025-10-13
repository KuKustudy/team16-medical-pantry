import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from "@testing-library/react";
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


describe('SimpleCam component', () => {


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
    expect(screen.getByTestId("webcam")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /capture/i })).toBeInTheDocument();
  });

  it('clicking the capture button does not crash', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleCam />} />
        </Routes>
      </BrowserRouter>
    );
    const button = screen.getByRole("button", { name: /capture/i });
    fireEvent.click(button);
    expect(button).toBeEnabled();
  });

  it('renders consistent layout', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleCam />} />
        </Routes>
      </BrowserRouter>
    );
    const container = document.querySelector(".simplecam-container");
    expect(container).toBeInTheDocument();
  });
});