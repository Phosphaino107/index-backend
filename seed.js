const { MongoClient } = require("mongodb");

const lessons = [
    { topic: "Maths",    location: "Hendon",        price: 100, space: 5, icon: "fa fa-calculator" },
    { topic: "English",  location: "Colindale",     price: 80,  space: 5, icon: "fa fa-book" },
    { topic: "Science",  location: "Brent Cross",   price: 90,  space: 5, icon: "fa fa-flask" },
    { topic: "Music",    location: "Golders Green", price: 95,  space: 5, icon: "fa fa-music" },
    { topic: "Art",      location: "Hendon",        price: 70,  space: 5, icon: "fa fa-paint-brush" },
    { topic: "Football", location: "Colindale",     price: 60,  space: 5, icon: "fa fa-futbol-o" },
    { topic: "Coding",   location: "Brent Cross",   price: 120, space: 5, icon: "fa fa-laptop" },
    { topic: "Drama",    location: "Golders Green", price: 85,  space: 5, icon: "fa fa-star" },
    { topic: "Chess",    location: "Hendon",        price: 50,  space: 5, icon: "fa fa-puzzle-piece" },
    { topic: "Swimming", location: "Colindale",     price: 75,  space: 5, icon: "fa fa-tint" }
];

async function seed() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || "theindex");

    await db.collection("lessons").deleteMany({});
    const result = await db.collection("lessons").insertMany(lessons);
    console.log(`Inserted ${result.insertedCount} lessons`);

    await client.close();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});