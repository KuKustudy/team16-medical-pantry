import React, { useRef } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import "./SimpleCam.css";

export default function SimpleCam() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

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

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:8080/imageprocessing", true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            try {
              const json = JSON.parse(xhr.responseText);
              const scannedText =
                json?.data?.fullText ?? json?.fullText ?? json?.text ?? "";
              navigate("/ConfirmationPage", { state: { scannedText } });
            } catch (e) {
              console.error("Bad JSON from server:", e);
            }
          } else {
            console.error("Upload failed:", xhr.status, xhr.responseText);
          }
        }
      };
      xhr.send(formData);
    }, "image/png");
  };

  return (
    <div className="simplecam-screen">
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

      {/* bottom fixed capture button */}
      <button className="simplecam-btn-fixed" onClick={capture}>
        Capture
      </button>
    </div>
  );
}
