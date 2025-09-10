import { useEffect, useRef, useState } from "react";

export function ScanPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [imgUrl, setImgUrl] = useState("");
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stop camera when component unmounts
  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // prefer back camera on mobile
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Cannot access the camera. Please check permissions (HTTPS or localhost is required).");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setImgUrl(dataUrl);
  };

  const uploadImage = async () => {
    if (!canvasRef.current) return;
    setLoading(true);
    setOcrResult(null);

    // Canvas -> PNG Blob
    const blob = await new Promise((resolve) =>
      canvasRef.current.toBlob(resolve, "image/png")
    );
    if (!blob) {
      setLoading(false);
      return;
    }

    const form = new FormData();
    form.append("file", blob, "frame.png");

    try {
      const res = await fetch("http://localhost:8080/api/ocr", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      setOcrResult(json);
    } catch (e) {
      console.error(e);
      alert("Upload failed. Please make sure the backend is running and CORS allows http://localhost:5173");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Scan</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: 640, border: "1px solid #ccc", borderRadius: 8 }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {!stream ? (
          <button onClick={startCamera}>Start Camera</button>
        ) : (
          <button onClick={stopCamera}>Stop Camera</button>
        )}
        <button onClick={captureFrame} disabled={!stream}>Capture Frame</button>
        <button onClick={uploadImage} disabled={!imgUrl || loading}>
          {loading ? "Uploading..." : "Upload & OCR"}
        </button>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {imgUrl && (
        <div style={{ marginTop: 12 }}>
          <div>Captured preview:</div>
          <img
            src={imgUrl}
            alt="captured frame"
            style={{ width: "100%", maxWidth: 320, border: "1px solid #eee" }}
          />
        </div>
      )}

      {ocrResult && (
        <div style={{ marginTop: 16 }}>
          <h3>OCR Result</h3>
          {ocrResult.success === false && <pre>{ocrResult.message || "OCR failed"}</pre>}
          {ocrResult.success && Array.isArray(ocrResult.data) && (
            <ul>
              {ocrResult.data.map((item) => (
                <li key={item.line}>
                  <strong>{item.line}.</strong> {item.text} ({item.confidence})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
