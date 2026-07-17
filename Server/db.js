const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

let dbConnection;

async function connectDB() {
  if (dbConnection) return dbConnection;

  try {
    await client.connect();
    console.log("MongoDB Connected Successfully");
    dbConnection = client.db("EmployeeManagement");
    return dbConnection;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}

module.exports = connectDB;
