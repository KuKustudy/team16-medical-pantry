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