const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Middleware: logger ----------
// Prints one line per request once the response has been sent:
// time | method + url | status code | how long it took
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        console.log(
            `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${Date.now() - start}ms`
        );
    });
    next();
});

let db;

// ---------- Routes ----------

// GET all lessons
app.get("/lessons", async (req, res) => {
    try {
        const lessons = await db.collection("lessons").find({}).toArray();
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: "Could not load lessons" });
    }
});

// ---------- Start: connect to Atlas first, then listen ----------
async function start() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME || "theindex");
    console.log("Connected to MongoDB Atlas");

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

start().catch(err => {
    console.error("Failed to start:", err);
    process.exit(1);
});