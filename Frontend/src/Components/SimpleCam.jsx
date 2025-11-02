import React, { useRef } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import "./SimpleCam.css";

export default function SimpleCam() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const host = window.location.hostname;
  const api_base = `http://${host}:8080`;


  /**
   * this function captures a photo (current frame of the web cam)
   * and send the photo to the backend for text scanning, after getting a
   * response from the backend, print it out in console.
   */
  const capture = () => {
    const video = camRef.current?.video;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // ensure the stream has data
    if (video.readyState < 4) {
      console.warn("Camera not ready yet");
      return;
    }

    // draw current frame to hidden canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // send to backend
    canvas.toBlob((blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("photo", blob, "photo.png");

      const xmlHttpRequest = new XMLHttpRequest();
      xmlHttpRequest.open("POST", `${api_base}/imageprocessing`, true);

      xmlHttpRequest.send(formData);
      console.log("frontend send out data via http request");

      // got a response from backend, print it out
      xmlHttpRequest.onreadystatechange = () => {
        if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {
          if (xmlHttpRequest.status === 200) {
            // parse JSON and extract the scanned text and send to confirmation page
            const responseFromBackend = JSON.parse(xmlHttpRequest.responseText);
            const scannedText = responseFromBackend.data.fullText;
            console.log("Upload successful:", scannedText);
            navigate("/ConfirmationPage", {state: { scannedText }});
          } else {
            console.log("Upload failed:", xmlHttpRequest.status);
          }
        };
      }
      xhr.send(formData);
    }, "image/png");
  };

  return (
    <div className="simplecam-container">
      <div className="simplecam-video-wrap">
        <Webcam
          ref={camRef}
          audio={false}
          screenshotFormat="image/png"
          videoConstraints={{ facingMode: { ideal: "environment" } }}
          className="simplecam-video"
          playsInline
          muted
        />
      </div>

      {/* hidden canvas for blob conversion */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button className="simplecam-btn-fixed" onClick={capture}>
        Capture
      </button>
    </div>
  );
}
