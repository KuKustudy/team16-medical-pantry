import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import SimpleCam from '../src/Components/SimpleCam'; // Use curly braces for named import
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from 'vitest';

// mock canvas API methods used by SimpleCam
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: vi.fn(),
  }));
  HTMLCanvasElement.prototype.toDataURL = vi.fn(
    () => 'data:image/jpeg;base64,stub'
  );
});

// Mock react-webcam so no actual camera is accessed during tests
vi.mock('react-webcam', () => {
  const React = require('react');
  const MockWebcam = React.forwardRef((props, ref) => {
    const videoEl = typeof document !== 'undefined'
      ? document.createElement('video')
      : { nodeName: 'VIDEO' };

    React.useImperativeHandle(ref, () => ({
      video: videoEl,
      getScreenshot: () => 'data:image/jpeg;base64,stub',
    }));

    return <video data-testid="webcam" />;
  });

  return { default: MockWebcam };
});

describe('SimpleCam component', () => {
  // Ensures that the webcam element and the Capture button both render correctly.
  it('renders webcam and capture button', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleCam />} />
        </Routes>
      </BrowserRouter>
    );
    expect(screen.getByTestId('webcam')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /capture/i })).toBeInTheDocument();
  });

  // Verifies that clicking the Capture button triggers screenshot logic and does not crash the app.
  it('clicking capture does not crash', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleCam />} />
        </Routes>
      </BrowserRouter>
    );
    const btn = screen.getByRole('button', { name: /capture/i });
    fireEvent.click(btn);
    expect(btn).toBeEnabled();
  });

  // Confirms that the overall layout container is rendered in the DOM.
  it('renders container layout', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleCam />} />
        </Routes>
      </BrowserRouter>
    );
    expect(document.querySelector('.simplecam-container')).toBeInTheDocument();
  });
});