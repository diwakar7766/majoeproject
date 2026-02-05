const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function seed() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");

  const ownerId = new mongoose.Types.ObjectId("696b9dd1c0a1719d35c2aabe");

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: ownerId,
  }));

  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);

  console.log("Database seeded!");
  mongoose.connection.close();
}

seed();
