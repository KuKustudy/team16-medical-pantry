import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./SimpleCam.css"; // 👈 import the stylesheet


// this file contains the web camera component
export default function SimpleCam() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);

  const [img, setImg] = useState(null);
  

  /**
   * this function captures a photo (current frame of the web cam)
   * and send the photo to the backend for text scanning, after getting a
   * response from the backend, print it out in console.
   */
  const capture = () => {
    const video = camRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // match canvas size to actual video resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // paints the current webcam frame onto the canvas, stretched or shrunk 
    // to exactly fit the canvas size, note that this will not affect photo's 
    // quality :)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // this is for photo preview
    const imageSrc = camRef.current?.getScreenshot();
    if (imageSrc) setImg(imageSrc);

    // convert the current frame to blob object, then wrap the blob object
    // in a formData to send to backend
    canvas.toBlob(function(blob){
      const formData = new FormData();
      formData.append('photo', blob, 'photo.png');

      const xmlHttpRequest = new XMLHttpRequest();
      xmlHttpRequest.open("POST", "http://localhost:8080/imageprocessing", true);

      xmlHttpRequest.send(formData);
      console.log("frontend send out data via http request");

      // got a response from backend, print it out
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
        data-testid="webcam"
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
