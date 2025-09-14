// how to run it: cd to backend folder, and in your terminal, enter: npm run dev
// then the backend will be run in localhost:8080/api

import express from "express";
import { EasyOCR } from "node-easyocr";
import cors from "cors";

const app = express();
const ocr = new EasyOCR();

// variables used to query the FDA API
const product_name = ""; // insert product name here
const gtin_for_query = "0368001578592"; // insert gtin here sameple: 0368001578592
const base_api_url = 'https://api.fda.gov/drug/enforcement.json?search=status:"Ongoing"';
const product_name_query =
  '+AND+openfda.generic_name:"';
const gtin_query = '+AND+openfda.upc:"';
const limit_query = '"&limit=10'
const result_list = [];

const corsOptions = {
    origin: ["http://localhost:5173"],
};


// initialise the OCR reader with desired language
await ocr.init(['en']);
console.log("ocr loaded");

app.use(cors(corsOptions));
app.use(express.json()); // automatically parse json request

app.get("/api", async (req, res) => {
  try {
    // queries api using GTIN first and name if no GTIN is entered
    let data;
    if (gtin_for_query !== "") {
        var converted_gtin = gtin_converter(gtin_for_query);
        console.log(converted_gtin);
        const fda_response = await fetch(base_api_url + gtin_query + converted_gtin + limit_query);
        data = await fda_response.json()

    } else if (product_name !== "") {
        fda_response = await fetch(base_api_url + product_name_query + product_name + limit_query);
        data = await fda_response.json()
        
    } else {
        data = { message: "No GTIN or Product Name" };
    }

    // pulling out the values for UI
    let results = data.results
    for (let i = 0; i < results.length; i++){
        var name = data.results[i].openfda.generic_name;
        var gtin = data.results[i].openfda.upc;
        var action = "Recall";
        var start_date = data.results[i].recall_initiation_date;
        var product_type = data.results[i].product_type;
        var hazard_class = data.results[i].classification;
        var data_source = "https://api.fda.gov/drug/enforcement.json"
        result_list.push([name, gtin, action, start_date, product_type, hazard_class, data_source])
        
    }

    // removing duplicates
    let unique_result = [...new Set(result_list.map(JSON.stringify))].map(JSON.parse);
    
    res.json(unique_result);


  } catch (fetch_error) {
    console.error(fetch_error);
    res.status(500).send("Error fetching FDA data");
  }
});

// function to convert GTIN 14 to GTIN 13
function gtin_converter(gtin14){
    var numbers = [];
    var check_digit = 0;
    var gtin13;

    if (gtin14.length == 13){
        return gtin14
    }
    
    // ignores the first digit and check digit
    for (var i = 1; i < gtin14.length-1; i++) {
        numbers.push(parseInt(gtin14[i]));
    }
    
    // calculate the check digit for GTIN13
    for (var i = 0; i < numbers.length; i++){
        
        if (i % 2 == 0){
            check_digit += numbers[i] * 1;
        } else{
            check_digit += numbers[i] * 3;
        }
    }

    // extra % 10 in case of check_digit % 10 == 0
    check_digit = (10 - (check_digit % 10)) % 10;

    numbers.push(check_digit)
    gtin13 = numbers.join("")

    return gtin13
}

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