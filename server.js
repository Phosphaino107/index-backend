const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Middleware 1: logger ----------
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

// ---------- Middleware 2: static images ----------
// If the file exists in the images folder, it is sent back.
// If it doesn't, express.static passes the request on and the next handler returns an error.
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/images", (req, res) => {
    res.status(404).json({ error: "Image not found" });
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

// POST a new order
// Body: { "name": "Ada", "phone": "0123456789", "items": [ { "lessonId": "...", "spaces": 2 } ] }
app.post("/orders", async (req, res) => {
    try {
        const { name, phone, items } = req.body;
        if (!name || !phone || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "name, phone and items are required" });
        }
        const order = { name, phone, items, createdAt: new Date() };
        const result = await db.collection("orders").insertOne(order);
        res.status(201).json({ message: "Order saved", insertedId: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: "Could not save order" });
    }
});

// PUT update any attribute of a lesson, e.g. { "space": 3 }
app.put("/lessons/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid lesson id" });
        }
        const changes = { ...req.body };
        delete changes._id;
        if (Object.keys(changes).length === 0) {
            return res.status(400).json({ error: "Nothing to update" });
        }
        const result = await db.collection("lessons").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: changes }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Lesson not found" });
        }
        res.json({ message: "Lesson updated", modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: "Could not update lesson" });
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