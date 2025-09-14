// how to run it: cd to backend folder, and in your terminal, enter: npm run dev
// then the backend will be run in localhost:8080/api

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
import {MongoClient, ServerApiVersion} from 'mongodb';
import { log } from "node:console";
import { stringify } from "node:querystring";

const app = express();
const ocr = new EasyOCR();
// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jesssin_db_user:PrPpU2xltmLPwNr2@medical-data.3tzehjr.mongodb.net/?retryWrites=true&w=majority&appName=Medical-Data";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});



const corsOptions = {
    origin: ["http://localhost:5173"],
};


// initialise the OCR reader with desired language
await ocr.init(['en']);
console.log("ocr loaded");

app.use(cors(corsOptions));
app.use(express.json()); // automatically parse json request

app.get("/api", async (req, res) =>{
    
    const thing = {
    GTIN: "hi",
    name: "dug",
    batch_number: 0,
    lot_number: 0}

    await mongoConnect(thing);
    res.json({ fruits: ["apple", "orange", "banana"] });
    // client.connect();
    // // Send a ping to confirm a successful connection
    // client.db("admin").command({ ping: 1 })
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    // const db = client.db("recall-guard");
    // const collection = db.collection("medical_items");
    // collection.find().toArray().then(result => console.log(result));

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

//mongodb database access

async function mongoConnect(medical_data) {
    
    await console.log("medical_data", medical_data)


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
    let should = []
    for (var key in medical_data){
        if (medical_data.hasOwnProperty(key)) {
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
            GTIN: 1,
            name: 1,
            batch_number: 1,
            lot_number: 1,
            score: { $meta: "searchScore" } 
            }
        }
    ]

    const result = await collection.aggregate(pipeline).toArray();
    await console.log(result);
 
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

export default app;