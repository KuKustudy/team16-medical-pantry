// how to run it: cd to backend folder, and in your terminal, enter: npm run dev
// then the backend will be run in localhost:8080/api

import express from "express";
import { EasyOCR } from "node-easyocr";
import cors from "cors";

const app = express();
const ocr = new EasyOCR();


const corsOptions = {
    origin: ["http://localhost:5173"],
};


// initialise the OCR reader with desired language
await ocr.init(['en']);
console.log("ocr loaded");

app.use(cors(corsOptions));
app.use(express.json()); // automatically parse json request

app.get("/api", (req, res) =>{
    res.json({ fruits: ["apple", "organge", "banana"] });
});

// this ia an async function, meaning we must wait til the function end
// then we can pass back to frontend
// ref: https://techbyvj.medium.com/introducing-node-easyocr-seamless-ocr-integration-for-node-js-applications-27b7ea1794fb
app.post("/imagescan", async (req, res) => {
    /*
        expect frontend to send
        {
        "imagePath": "/folder/photo.jpg"
        }
    */
    
    try {
        const imagePath = req.body.imagePath;
        console.log("Received image paths", imagePath);

        const result = await ocr.readText(imagePath);
        console.log("OCR Result:");
        result.forEach((item, index) => {
            console.log(`Line ${index + 1}:`);
            console.log(`  Text: ${item.text}`);
            console.log(`  Confidence: ${(item.confidence * 100).toFixed(2)}%`);
            console.log(`  Bounding Box: ${JSON.stringify(item.bbox)}`);
            console.log('---');
        })


        // Convert OCR result into a JSON-friendly format
        const jsonResponse = result.map((item, index) => ({
            line: index + 1,
            text: item.text,
            confidence: (item.confidence * 100).toFixed(2) + "%",
        }));

        // Send the JSON response back to frontend
        res.json({ success: true, data: jsonResponse });


    } catch (error) {
        console.error("OCR Error", error.message);
    } finally {
        await ocr.close();
    }



})


// this ia an async function, meaning we must wait til the function end
// then we can pass back to frontend
// ref: https://techbyvj.medium.com/introducing-node-easyocr-seamless-ocr-integration-for-node-js-applications-27b7ea1794fb
app.get("/imagescan_testing", async (req, res) => {
    /*
        expect frontend to send
        {
        "imagePath": "/folder/photo.jpg"
        }
    */
    
    try {
        const imagePath = "color_image.png";
        console.log("Received image paths", imagePath);

        const result = await ocr.readText(imagePath);
        console.log("OCR Result:");
        result.forEach((item, index) => {
            console.log(`Line ${index + 1}:`);
            console.log(`  Text: ${item.text}`);
            console.log(`  Confidence: ${(item.confidence * 100).toFixed(2)}%`);
            console.log(`  Bounding Box: ${JSON.stringify(item.bbox)}`);
            console.log('---');
        })


        // Convert OCR result into a JSON-friendly format
        const jsonResponse = result.map((item, index) => ({
            line: index + 1,
            text: item.text,
            confidence: (item.confidence * 100).toFixed(2) + "%",
        }));

        // Send the JSON response back to frontend
        res.json({ success: true, data: jsonResponse });


    } catch (error) {
        console.error("OCR Error", error.message);
    } finally {
        await ocr.close();
    }



})
app.listen(8080, () => {
    console.log("Server started on port 8080");
});

export default app;