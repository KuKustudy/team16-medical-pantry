import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./SimpleCam.css"; // 👈 import the stylesheet

export default function SimpleCam() {
  const camRef = useRef(null);
  const [img, setImg] = useState(null);

  const capture = () => {
    const imageSrc = camRef.current?.getScreenshot();
    if (imageSrc) setImg(imageSrc);
  };

  return (
    <div className="simplecam-container">
      <Webcam
        ref={camRef}
        audio={false}
        screenshotFormat="image/png"
        videoConstraints={{ facingMode: "environment" }}
        style={{ width: "100%", borderRadius: 12 }}
        playsInline
        muted
      />

      <button className="simplecam-btn" onClick={capture}>
        Capture
      </button>

      {img && (
        <>
          <h4>Preview</h4>
          <img src={img} alt="capture" className="simplecam-preview" />
        </>
      )}
    </div>
  );
}
