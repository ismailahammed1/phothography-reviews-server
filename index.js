const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017";

// Create a new MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collection
const databaseName = "Photographyservice";
const collectionName = "service";

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB!");

    // Access the database and collection
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Define the route to get all services
    app.get('/services', async (req, res) => {
      try {
        const cursor = collection.find(); // Use the collection object
        const result = await cursor.toArray();
        res.status(200).json(result);
      } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ error: 'Failed to retrieve services' });
      }
    });

    // Define the route to get a specific service by ID
    app.get('/services/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }; // Use ObjectId to match the MongoDB document ID
        const result = await collection.findOne(query); // Use collection object, not collectionName
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ error: 'Service not found' });
        }
      } catch (error) {
        console.error("Error fetching service by ID:", error);
        res.status(500).json({ error: 'Failed to retrieve the service' });
      }
    });

    // Ping the database to confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Successfully connected to MongoDB!");

  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

// Run the database connection and server start
run().catch(console.dir);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
