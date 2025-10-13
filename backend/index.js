// how to run it: cd to backend folder, and in your terminal, enter: "&limit=10npm run dev
// then the backend will be run in localhost:8080

/* 
Medical data format
let medical_data = {
GTIN: "number",
name: "drug name,"
batch_number: "batch_num",
lot_number: "lot_num",
}

*/

import express from "express";
import { EasyOCR } from "node-easyocr";
import cors from "cors";
import multer from "multer";
import fs from "fs";  
import {MongoClient, ServerApiVersion} from 'mongodb';
import dotenv from "dotenv";
import { log } from "node:console";
import { stringify } from "node:querystring";

// create new app and easyOCR instance
const app = express();
const ocr = new EasyOCR();

// const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config();
const uri = process.env.DATABASE_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

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




/*
* this sends an HTTP GET request to FDA database API with query parameters.
*
* parameter 1: product name
* paramater 2: GTIN (an unique id for medical item)
* if no parameter has been specified, a message will be sent back to frontend.
*/
app.get("/api", async (req, res) => {
  try {
    res.json(await FDA_API_calls("", "0368001578592"))

  } catch (fetch_error) {
    console.error(fetch_error);
    res.status(500).send("Error fetching FDA data");
  }
});

async function FDA_API_calls(product_name, product_gtin){

    // const product_name = "Surveying Laser Product"; // insert product name here sample: Surveying Laser Product
    // const product_gtin = ""; // insert gtin here sample: 0368001578592
        
    try {
        // queries api using GTIN first and name if no GTIN is entered
        var drug_data;
        var device_data;
        var result_list = [];
        
        drug_data = await fda_drug_recalls(product_name, product_gtin);
        if (drug_data.error && drug_data.error.code == "NOT_FOUND") {
            device_data = await fda_device_recalls(product_name);
        }
            
        // pulling out the values for UI
        var results;
        if (device_data){
            results = device_data.results
        } else {
            results = drug_data.results
        }

        // push results based on product type
        if (device_data){
            for (let i = 0; i < results.length; i++){
                var name = device_data.results[i].openfda.device_name;
                var action = "Recall";
                var lot_number = device_data.results[i].code_info;
                var data_source = "https://api.fda.gov/device/recall.json";

                var start_date = device_data.results[i].event_date_initiated;
                result_list.push([name, action, lot_number, start_date, data_source])    
            }
        } else {
            for (let i = 0; i < results.length; i++){
                var name = drug_data.results[i].openfda.generic_name;
                var gtin = drug_data.results[i].openfda.upc;
                var action = "Recall";
                var lot_number = drug_data.results[i].code_info;
                var data_source = "https://api.fda.gov/drug/enforcement.json";

                var start_date = drug_data.results[i].recall_initiation_date;
                var product_type = drug_data.results[i].product_type;
                var hazard_class = drug_data.results[i].classification;
                result_list.push([name, gtin, action, lot_number, start_date, product_type, hazard_class, data_source])
            
            }
        }

        // removing duplicates
        let unique_result = [...new Set(result_list.map(JSON.stringify))].map(JSON.parse);
        return unique_result;
        

    } catch (fetch_error) {
        console.error(fetch_error);
        return "Error fetching FDA data";
    }

}

// function for fda drug queries
async function fda_drug_recalls(name, gtin){
    const name_query = `https://api.fda.gov/drug/enforcement.json?search=status:"Ongoing"+AND+openfda.generic_name:"${name}"&limit=10`
    const gtin_query = `https://api.fda.gov/drug/enforcement.json?search=status:"Ongoing"+AND+openfda.upc:"${gtin}"&limit=10`

    let data;
    if (gtin !== "") {
        var converted_gtin = gtin_converter(gtin);
        const fda_response = await fetch(gtin_query);
        data = await fda_response.json()

    } else if (name !== "") {
        const fda_response = await fetch(name_query);
        data = await fda_response.json()
        
    } else {
        data = { message: "No GTIN or Product Name" };
    }

    return data;
}

// function for fda device queries
async function fda_device_recalls(name){
    let data;
    var search_query = `https://api.fda.gov/device/recall.json?search=recall_status:"Open, Classified"+AND+openfda.device_name:"${name}"&limit=10`
    if (name !== "") {
        const fda_response = await fetch(search_query);
        data = await fda_response.json()
        
    } else {
        data = { message: "No Product Name" };
    }

    return data;
}

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
        // if you want print line by line
        // result.forEach((item, index) => {
        //     console.log(`Line ${index + 1}:`);
        //     console.log(`  Text: ${item.text}`);
        //     console.log(`  Confidence: ${(item.confidence * 100).toFixed(2)}%`);
        //     console.log(`  Bounding Box: ${JSON.stringify(item.bbox)}`);
        //     console.log('---');
        // })

        const fullText = result.map(item => item.text).join(" ");

        // Log the concatenated text
        console.log("Full OCR Text:", fullText);


        // Convert OCR result into a JSON-friendly format
        // const jsonResponse = result.map((item, index) => ({
        //     line: index + 1,
        //     text: item.text,
        //     confidence: (item.confidence * 100).toFixed(2) + "%",
        //     fullText: fullText,
        // }));

        const jsonResponse = {
            fullText: fullText,
        };

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

app.post("/imagescan", async (req, res) => {
  const { imagePath } = req.body;
  if (!imagePath) {
    return res.status(400).json({ success: false, error: "No imagePath provided" });
  }

  try {
    const result = await ocr.readText(imagePath);
    const data = result.map(item => ({
      text: item.text,
      confidence: item.confidence
        ? (item.confidence * 100).toFixed(2) + "%"
        : undefined,
      bbox: item.bbox || undefined
    }));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("OCR Error", error.message);
    return res.status(500).json({ success: false, error: "OCR failed" });
  }
});

// specify the API address for backend
if (process.env.NODE_ENV !== "test") {
  app.listen(8080, () => console.log("Server started on port 8080"));
}

//mongodb database access
app.use(express.json());
app.post("/mongoSearch", async (req, res) => {
    console.log(req.body); 
  try {
    const medical_data = req.body;
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect()
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const db = client.db("recall-guard");
    const collection = db.collection("medical_items");
    // collection.find().toArray().then(result => console.log(result));

    // convert medical_data object into mongo search
    let should = []
    for (var key in medical_data){
        if (medical_data.hasOwnProperty(key) && 
            String(medical_data[key]) != '') {
            await should.push({
                text: {
                    query: String(medical_data[key]),
                    path: String(key),
                    fuzzy: { maxEdits: 2 }
                }
            })
        }
    }

    const pipeline = [
        {
            $search: {
                index: "default",
                compound: {
                    should: should
                }
            }
        },
        // Add confidence scores to data
        {
            $project: {
            name: 1,
            GTIN: 1,
            batch_number: 1,
            lot_number: 1,
            score: { $meta: "searchScore" } 
            }
        }
    ]

    const result = await collection.aggregate(pipeline).toArray();
    console.log(result);
    res.json(result);
 
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
})

app.post("/mongoInsert", async (req, res) => {

    const medical_data = req.body;
    await console.log("inserting ", medical_data);
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect()
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        const db = client.db("recall-guard");
        const collection = db.collection("medical_items");
        // collection.find().toArray().then(result => console.log(result));

        // convert medical_data object into mongo search
        await collection.insertMany(medical_data);
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
})

export default app;