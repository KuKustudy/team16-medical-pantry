import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import SimpleCam from '../src/Components/SimpleCam'; // Use curly braces for named import
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";

HTMLCanvasElement.prototype.getContext = () => ({
  drawImage: vi.fn(),
});
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,AAAA');

vi.mock('react-webcam', () => ({
  __esModule: true,
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      video: document.createElement('video'),
      getScreenshot: () => 'data:image/png;base64,FAKE',
    }));
    return <video data-testid="webcam" />;
  }),
}));

describe('SimpleCam component', () => {

  it('renders webcam and capture button', () => {
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