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
const DATABASE_NAME = process.env.DATABASE_NAME;
const RECALL_COLLECTION = process.env.RECALL_COLLECTION;
const IS_EXPOSED = process.env.IS_EXPOSED;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

app.use(cors({
  origin: true,            // reflect the requesting origin
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

let corsOptions
// configuration for the app
if (!IS_EXPOSED) {
    corsOptions = {
    // specify that we only accept request from our frontend
    origin: ["http://localhost:5173"], 
    };
} else {
    corsOptions = {
        // accept requests from anyone
        origin: "*", 
    };
}


app.use(cors(corsOptions));
app.use(express.json()); // automatically parse json request


// initialise the OCR reader with desired language
await ocr.init(['en']);

/*
* This function queries the open API maintained by the U.S. Food & Drug 
* Administration department, it takes name and GTIN of a medical item, and
* returns recall information if it is being recalled.
*
* sample queries: "Surveying Laser Product" "0368001578592"
*
* parameter 1: product name
* paramater 2: GTIN (an unique id for medical item)
* if no parameter has been specified, a message will be sent back to frontend.
*
* A medical item is of two types, it can be a recalled medical device or a drug.
* so we first checks the drug API, then checks the device API if there's no 
* results from drugs API
* 
*/
async function FDA_API_calls(product_name, product_gtin){

    const regex = (/(([A-Z]|[0-9]){5,})+/g)
        
    try {
        // queries api using GTIN first and name if no GTIN is entered
        var drug_data;
        var device_data;
        var result_list = [];
        
        // medical item could be a medical device or drug
        // query the FDA recalled drug database first, and stored the result
        drug_data = await fda_drug_recalls(product_name, product_gtin);

        // if no recall information can be found, we then query the FDA recalled
        // medical device database, and store it in another variable
        if (drug_data.error && drug_data.error.code == "NOT_FOUND") {
            device_data = await fda_device_recalls(product_name);
        }
            
        // one of the fetched drug recall info and medical device info will be 
        // filled, pull out values for UI
        var results = [];
        if (device_data && device_data.results){
            results = device_data.results
        } else if (drug_data && drug_data.results) {
            results = drug_data.results
        } else {
            console.log("No FDA results found");
            return [];
        }

        // if no results found, return empty array, assumed that we have 
        // done the search in our own database before calling this function
        if (!results || results.length === 0) {
            return [];
        }

        // push results based on product type
        if (device_data){      
            for (let i = 0; i < results.length; i++){
                var item_name = device_data.results[i].openfda.device_name ?? device_data.results[i].product_description;
                var action = "Recall";
                var lot_number = device_data.results[i].code_info;
                var data_source = "https://api.fda.gov/device/recall.json";

                // Lot number Regex
                var regex_matches = lot_number.match(regex)
                if (regex_matches != null) {
                    lot_number = regex_matches;
                }

                var start_date = device_data.results[i].event_date_initiated;
                result_list = push_without_duplicates(result_list, {
                    "item_name": item_name,
                    "action": action,
                    "lot_number": lot_number,
                    "start_date": start_date,
                    "data_source": data_source
                });    
            }
        } else {

            for (let i = 0; i < results.length; i++){
                var item_name = drug_data.results[i].openfda.generic_name ?? 
                                drug_data.results[i].openfda.brand_name ?? 
                                drug_data.results[i].product_description;
                var GTIN = drug_data.results[i].openfda.upc;
                console.log(GTIN)
                var action = "Recall";
                var lot_number = drug_data.results[i].code_info;
                var data_source = "https://api.fda.gov/drug/enforcement.json";

                var start_date = drug_data.results[i].recall_initiation_date;
                var product_type = drug_data.results[i].product_type;
                var hazard_class = drug_data.results[i].classification;

                var regex_matches = lot_number.match(regex)
                if (regex_matches != null) {
                    lot_number = regex_matches;
                }

                result_list = push_without_duplicates(result_list, {
                    "item_name": item_name,
                    "GTIN": GTIN,
                    "action": action,
                    "lot_number": lot_number,
                    "start_date": start_date,
                    "product_type": product_type,
                    "hazard_class": hazard_class,
                    "data_source": data_source
                });
            
            }
        }
        
        // Turn all arrays into strings
        for (let result of result_list) {
            for (let key in result) {
                if (Array.isArray(result[key])) {
                    result[key] = result[key].join(", ");
                }
            }
        }

        // Previous remove duplicates code
        //let unique_result = [...new Set(result_list.map(JSON.stringify))].map(JSON.parse);
        return result_list;
        

    } catch (fetch_error) {
        console.error(fetch_error);
        return "Error fetching FDA data";
    }

}

/*
* This function is a helper function for the function 'FDA_API_calls'
* this function queries the open API maintained by the U.S. Food & Drug 
* Administration (FDA) department, it takes name and GTIN of a medical item, and
* check whether it is in the recalled drug FDA database.
* 
*/
async function fda_drug_recalls(name, gtin){
    const name_query = `https://api.fda.gov/drug/enforcement.json?search=status:"Ongoing"+AND+(openfda.generic_name:"${name}"+OR+openfda.brand_name:"${name}"+OR+product_description:"${name}")&limit=10`
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

/*
* This function is a helper function for the function 'FDA_API_calls'
* this function queries the open API maintained by the U.S. Food & Drug 
* Administration (FDA) department, it takes name and GTIN of a medical item, and
* check whether it is in the recalled medical device FDA database.
* 
*/
async function fda_device_recalls(name){
    let data;
    var search_query = `https://api.fda.gov/device/recall.json?search=recall_status:"Open, Classified"+AND+(openfda.device_name:"${name}"+OR+product_description:"${name}")&limit=10`
    if (name !== "") {
        const fda_response = await fetch(search_query);
        data = await fda_response.json()
        
    } else {
        data = { message: "No Product Name" };
    }

    return data;
}

/*
* This function is a helper function for the function 'FDA_API_calls'
* It is used because FDA API returns multiple results for the same item name
* with different GTIN or lot number. Hence, to make sure the data we sent to
* frontend is neat, where information are grouped by item name, we use this
* function to concatenate results together.
*
* sample input: [{item1: "a", item2: [1, 3]}], {item1: "a", item2: [1, 2, 4]}
* sample output: [{item1: "a", item2: [1, 2, 3, 4]}]
*/
function push_without_duplicates(list, item) {
    // Check if there's an existing matching object
    for (let existing of list) {
        let keys = Object.keys(item);
        let differing_arrays = [];

        // Compare all key values
        let all_same_except_arrays = keys.every(key => {
            const a = existing[key];
            const b = item[key];

            if (Array.isArray(a) && Array.isArray(b)) {
                differing_arrays.push(key);
                return true;
            }

            return a == b;
        });

        // If every field except for the arrays are the same then combine the arrays
        if (all_same_except_arrays) {
            for (let key of differing_arrays) {
                // Merge and deduplicate the arrays
                existing[key] = [...new Set([...existing[key], ...item[key]])];
            }
            return list;
        }
    }

    // If it isn't a duplicate then just push it
    list.push(item);
    return list;
}


/*
* This function is a helper function for the function 'fda_drug_recalls'
* It is used to convert GTIN 14 to GTIN 13
*
*/
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


        const fullText = result.map(item => item.text).join(" ");

        // Log the concatenated text
        console.log("Full OCR Text:", fullText);

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


/*
* this function is for testing purpose only, and should not be called by
* frontend. It executes a POST request received from frontend.
* expected input front frontend: an image path
* this function will then scan text from the image using EasyOCR,
* and then return the scanned result to frontend in JSON format
*/
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
    if (IS_EXPOSED == "true") {
        app.listen(8080, '0.0.0.0', () => {console.log('Server running on http://0.0.0.0:8080');});
    } else {
        app.listen(8080, () => console.log("Server started on port 8080"));
    }
}


/*
* This function searches various databases and resources to attempt to find if
* the input item has been recalled.
* We first query our own database - MongoDB
* Then it searches in FDA's drug and medical device recall database.
*
* sample input: 
* {GTIN: "023939301293",
* name: "drug name",
* lot_number: "0F238A",}
* 
*/
app.use(express.json());
app.post("/search", async (req, res) => {
    console.log("received request",req.body); 
    let medical_data = req.body;

    // Search mongoDB  
    let mongoResult = await mongo_search(medical_data)
    if (mongoResult.length > 0) {
        console.log("Sending mongo database result to front end.");
        res.json(mongoResult);
    } else {
        try {
            console.log("search in FDA with the data", medical_data);
            var results = await FDA_API_calls(medical_data.item_name, medical_data.GTIN);
            res.json(results);
        } catch (fetch_error) {
            console.error(fetch_error);
            res.status(500).send("Error fetching FDA data");
        }
    }
})

/*
* This function connects to a specifically formatted mongoDB database
* it takes medical_data as input
* make a search in the database, and return matched object
* if you search 'random'
* the result from database will format as follow: 
[
  {
    _id: new ObjectId('68fdc502d0ea37aab304c1b5'),
    item_name: 'random',
    GTIN: '8888888888',
    lot_number: '8888',
    score: 0.21363800764083862
  },
  {
    _id: new ObjectId('68fdc57b38155035442a3547'),
    item_name: 'random',
    GTIN: '88888888889',
    lot_number: '9999',
    score: 0.21363800764083862
  },
  {
    _id: new ObjectId('68fdc5ab38155035442a3548'),
    item_name: 'random1',
    GTIN: '888888888881',
    lot_number: '1',
    score: 0.17803166806697845
  }
]
* 
* 
*/
async function mongo_search(medical_data) {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect()
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        const db = client.db(database_name);
        const collection = db.collection(recall_collection);
        // collection.find().toArray().then(result => console.log(result));

        // convert medical_data object into mongo search
        let should = []
        const { item_name, GTIN, lot_number } = medical_data;
        if (item_name && item_name.trim() !== "") {
        should.push({
            text: {
            query: item_name,
            path: "item_name",
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
                item_name: 1,
                name: 1,
                GTIN: 1,
                lot_number: 1,
                action: 1, 
                start_date: 1, 
                product_type: 1, 
                hazard_class: 1, 
                lot_num: 1,
                source: 1,
                description: 1,
                score: { $meta: "searchScore" } 
                }
            },
            { $limit: 10}
        ]

        const result = await collection.aggregate(pipeline).toArray();     
        console.log("result from database format as follow:", result);

        // If there is a list of GTINS return it as a string
        if (result.GTIN && typeof(result.GTIN) != String) {
        result.GTIN = result.GTIN.join(", ");
        }

        // If there is a list of lot numbers return it as a string
        if (result.lot_number && typeof(result.lot_number) != String) {
        result.lot_number = result.lot_number.join(", ");
        }

        console.log(result);

        return(result);
    
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }

}

/*
* this function executes a POST request received from frontend.
* expected input front frontend: information about a medical item including
* item_name, GTIN, lot number
* this function will then insert the new item into our MongoDB database.
 */
app.post("/insert", async (req, res) => {
    console.log(req.body); 
    let medical_data = req.body;

    // Inserts medical data in MongoDB
    try {
        await mongo_recall_insert(medical_data);
        console.log("Successful insert");
        res.status(200).send("Successful insert");
    } catch (fetch_error) {
        console.error(fetch_error);
        res.status(500).send("Error inserting data into database");
    }
})

/*
 * This function inserts new recall medical item into our MongoDB database.
 */
async function mongo_recall_insert(medical_data) {
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
        await collection.insertOne(medical_data);
    
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function mongo_search_history_insert(name, medical_data) {
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
}

export default app;
