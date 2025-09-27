// how to run it: cd to backend folder, and in your terminal, enter: npm run dev
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
import { log } from "node:console";
import { stringify } from "node:querystring";

// create new app and easyOCR instance
const app = express();
const ocr = new EasyOCR();
// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jesssin_db_user:PrPpU2xltmLPwNr2@medical-data.3tzehjr.mongodb.net/?retryWrites=true&w=majority&appName=Medical-Data?directConnection=true";
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
const product_name = ""; // insert product name here
const gtin_for_query = "0368001578592"; // insert gtin here sample: 0368001578592
const base_api_url = 'https://api.fda.gov/drug/enforcement.json?search=status:"Ongoing"';
const product_name_query =
  '+AND+openfda.generic_name:"';
const gtin_query = '+AND+openfda.upc:"';
const limit_query = '"&limit=10'
const result_list = [];


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
    if (gtin_for_query !== "") {
        var converted_gtin = gtin_converter(gtin_for_query);
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
    res.json(data);

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


// specify the API address for backend
app.listen(8080, () => {
    console.log("Server started on port 8080");
});

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
    const { name, GTIN, lot_number } = req.body;
    if (name && name.trim() !== "") {
      should.push({
        text: {
          query: name,
          path: "name",
          fuzzy: { maxEdits: 2 }
        }
      });
    }

    
    if (GTIN && GTIN.trim() !== "") {
        should.push({
        text: {
            query: GTIN,
            path: "GTIN",
        }
        });
    };
    

        if (lot_number && lot_number.trim() !== "") {
        should.push({
        text: {
            query: lot_number,
            path: "lot_number",
        }
        });
    };


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
            lot_number: 1,
            action: 1, 
            start_date: 1, 
            product_type: 1, 
            hazard_class: 1, 
            lot_num: 1,
            source: 1,
            score: { $meta: "searchScore" } 
            }
        },
        { $limit: 10}
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