// how to run it: cd to backend folder, and in your terminal, enter: npm run dev
// then the backend will be run in localhost:8080

import express from "express";
import { EasyOCR } from "node-easyocr";
import cors from "cors";
import multer from "multer";
import fs from "fs";  

// create new app and easyOCR instance
const app = express();
const ocr = new EasyOCR();

// configuration for the app
const corsOptions = {
    // specify that we only accept request from our frontend
    origin: ["http://localhost:5173"], 
};
app.use(cors(corsOptions));
app.use(express.json()); // automatically parse json request


// initialise the OCR reader with desired language
await ocr.init(['en']);


// variables used to query the FDA API
const product_name = ""; // insert product name here
const gtin = ""; // insert gtin here sameple: 0368001578592
const base_api_url = 'https://api.fda.gov/drug/enforcement.json?search=status:"Ongoing"';
const product_name_query =
  '+AND+openfda.generic_name:"' + product_name + '"&limit=10';
const gtin_query = '+AND+openfda.upc:"' + gtin + '"&limit=10';


/*
* this sends an HTTP GET request to FDA database API with query parameters.
*
* parameter 1: product name
* paramater 2: GTIN (an unique id for medical item)
* if no parameter has been specified, a message will be sent back to frontend.
*/
app.get("/api", async (req, res) => {
  try {
    // queries api using GTIN first and name if no GTIN is entered
    let data;
    if (gtin !== "") {
      const fda_response = await fetch(base_api_url + gtin_query);
      data = await fda_response.json()
    } else if (product_name !== "") {
      fda_response = await fetch(base_api_url + product_name_query);
      data = await fda_response.json()
    } else {
      data = { message: "No GTIN or Product Name" };
    }

    res.json(data);

  } catch (fetch_error) {
    console.error(fetch_error);
    res.status(500).send("Error fetching FDA data");
  }
});


/*
* this imitates a POST request received from frontend.
* This function scans text from a prestored image and prints the scanned
* result to the console. This could be potentially included in the testing file.
*/
app.get("/imagescan_testing", async (req, res) => {
    
    try {
        // access the image via image path
        const imagePath = "color_image.png";
        console.log("Received image paths", imagePath);

        const result = await ocr.readText(imagePath);

        // print scanned result line by line
        console.log("OCR Result:");
        result.forEach((item, index) => {
            console.log(`Line ${index + 1}:`);
            console.log(`  Text: ${item.text}`);
            console.log(`  Confidence: ${(item.confidence * 100).toFixed(2)}%`);
            console.log(`  Bounding Box: ${JSON.stringify(item.bbox)}`);
            console.log('---');
        })
    } catch (error) {
        console.error("OCR Error", error.message);
    } finally {
        await ocr.close();
    }

})



/*
* this function executes a POST request received from frontend.
* expected input front frontend: an image path
* this function will then scan text from the image using EasyOCR,
* and then return the scanned result to frontend in JSON format
*
* Note: this ia an async function, meaning we must wait til the function ended
*       before we pass anything back to frontend.
*
* an example of what the req.file will look like
    {
    fieldname: 'photo',
    originalname: 'photo.png',
    encoding: '7bit',
    mimetype: 'image/png',
    destination: 'uploads/',
    filename: 'cb84e4d69822fd146c4514246b211bf9',
    path: 'uploads/cb84e4d69822fd146c4514246b211bf9',
    size: 321427
    }

*/
const upload = multer({ dest: 'uploads/' });
app.post("/imageprocessing", upload.single('photo'), async (req, res) => {

    try {
        console.log(req.file);

        const imagePath = req.file.path;
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

        // delete the image file after scanning
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Failed to delete file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });

    } catch (error) {
        console.error("OCR Error", error.message);
    }
})


// specify the API address for backend
app.listen(8080, () => {
    console.log("Server started on port 8080");
});

export default app;