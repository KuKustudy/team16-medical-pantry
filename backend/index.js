// how to run it: cd to backend folder, and in your terminal, enter: npm run dev
// then the backend will be run in localhost:8080/api


const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:3000"],
};

app.use(cors(corsOptions));

app.get("/api", (req, res) =>{
    res.json({ fruits: ["apple", "organge", "banana"] });
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});

//mongodb database access
//mongodb+srv://jesssin_db_user:PrPpU2xltmLPwNr2@medical-data.3tzehjr.mongodb.net/?retryWrites=true&w=majority&appName=Medical-Data
/*const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jesssin_db_user:PrPpU2xltmLPwNr2@medical-data.3tzehjr.mongodb.net/?retryWrites=true&w=majority&appName=Medical-Data";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);*/