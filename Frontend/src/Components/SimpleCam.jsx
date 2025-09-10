import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./SimpleCam.css"; // 👈 import the stylesheet

export default function SimpleCam() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);

  const [img, setImg] = useState(null);
  

  const capture = () => {
    const video = camRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // match canvas size to actual video resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // paints the current webcam frame onto the canvas, stretched or shrunk to exactly fit the canvas size
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageSrc = camRef.current?.getScreenshot();
    if (imageSrc) setImg(imageSrc);

    canvas.toBlob(function(blob){
      const formData = new FormData();
      formData.append('photo', blob, 'photo.png');

      const xmlHttpRequest = new XMLHttpRequest();
      xmlHttpRequest.open("POST", "http://localhost:8080/imageprocessing", true);

      xmlHttpRequest.send(formData);
      console.log("frontend send out data via http reequest");

      xmlHttpRequest.onreadystatechange = () => {
      if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {
        if (xmlHttpRequest.status === 200) {
          console.log("Upload successful:", xmlHttpRequest.responseText);
        } else {
          console.log("Upload failed:", xmlHttpRequest.status);
        }
      }};



    },'image/png');




  }

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

      {/* hidden canvas for blob conversion */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

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
